import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Contract, ContractStatus, ContractType, PartyType } from './entities/contract.entity';
import { ContractPayment, PaymentStatus } from './entities/contract-payment.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractPaginationDto } from './dto/pagination.dto';
import { ActivateContractDto } from './dto/activate-contract.dto';
import { RenewContractDto } from './dto/renew-contract.dto';
import { TerminateContractDto } from './dto/terminate-contract.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(ContractPayment)
    private readonly contractPaymentRepository: Repository<ContractPayment>,
  ) {}

  async create(createDto: CreateContractDto): Promise<Contract> {
    // Convert empty string to null for organizationId
    const organizationId = createDto.organization_id && createDto.organization_id.trim() !== '' 
      ? createDto.organization_id 
      : null;

    // Validate contract_type
    if (!createDto.contract_type || !Object.values(ContractType).includes(createDto.contract_type as ContractType)) {
      throw new BadRequestException(
        `Invalid contract_type: "${createDto.contract_type || 'undefined'}". Must be one of: ${Object.values(ContractType).join(', ')}`,
      );
    }

    // Validate party_type if provided
    if (createDto.party_type && !Object.values(PartyType).includes(createDto.party_type as PartyType)) {
      throw new BadRequestException(
        `Invalid party_type: "${createDto.party_type}". Must be one of: ${Object.values(PartyType).join(', ')}`,
      );
    }

    // Check for duplicate contract number
    const existing = await this.contractRepository.findOne({
      where: {
        contractNumber: createDto.contract_number,
        organizationId: organizationId === null ? IsNull() : organizationId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Contract with number ${createDto.contract_number} already exists`,
      );
    }

    const contract = this.contractRepository.create({
      organizationId,
      contractNumber: createDto.contract_number,
      contractName: createDto.contract_name,
      contractType: createDto.contract_type as ContractType,
      status: ContractStatus.DRAFT,
      partyType: createDto.party_type ? (createDto.party_type as PartyType) : null,
      partyId: createDto.party_id || null,
      startDate: new Date(createDto.start_date),
      endDate: createDto.end_date ? new Date(createDto.end_date) : null,
      totalValue: createDto.total_value || 0,
      currency: createDto.currency || 'USD',
      paymentTerms: createDto.payment_terms,
      billingFrequency: createDto.billing_frequency || null,
      autoRenew: createDto.auto_renew || false,
      renewalDate: createDto.renewal_date ? new Date(createDto.renewal_date) : null,
      projectId: createDto.project_id || null,
      costCenterId: createDto.cost_center_id || null,
      notes: createDto.notes,
      documentUrl: createDto.document_url,
    });

    try {
      return await this.contractRepository.save(contract);
    } catch (error) {
      console.error('Error saving contract to database:', error);
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new BadRequestException(
          `Contract with number ${createDto.contract_number} already exists`,
        );
      }
      throw error;
    }
  }

  async findAll(paginationDto: ContractPaginationDto): Promise<Contract[]> {
    const where: any = {};

    if (paginationDto.status) {
      where.status = paginationDto.status;
    }

    if (paginationDto.contract_type) {
      where.contractType = paginationDto.contract_type;
    }

    if (paginationDto.customer_id) {
      where.partyType = PartyType.CUSTOMER;
      where.partyId = paginationDto.customer_id;
    }

    if (paginationDto.vendor_id) {
      where.partyType = PartyType.VENDOR;
      where.partyId = paginationDto.vendor_id;
    }

    if (paginationDto.start_date || paginationDto.end_date) {
      if (paginationDto.start_date && paginationDto.end_date) {
        where.startDate = MoreThanOrEqual(new Date(paginationDto.start_date));
        where.endDate = LessThanOrEqual(new Date(paginationDto.end_date));
      } else if (paginationDto.start_date) {
        where.startDate = MoreThanOrEqual(new Date(paginationDto.start_date));
      } else if (paginationDto.end_date) {
        where.endDate = LessThanOrEqual(new Date(paginationDto.end_date));
      }
    }

    const queryBuilder = this.contractRepository.createQueryBuilder('contract').where(where);

    if (paginationDto.sort) {
      let sortField = paginationDto.sort.trim();
      let sortOrder: 'ASC' | 'DESC' = 'ASC';

      if (sortField.startsWith('-')) {
        sortField = sortField.substring(1).trim();
        sortOrder = 'DESC';
      } else if (sortField.includes(':')) {
        const [field, order] = sortField.split(':');
        sortField = field.trim();
        sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      }

      const mappedField = this.mapSortField(sortField);
      const validSortFields = ['contractNumber', 'contractName', 'contractType', 'status', 'startDate', 'endDate', 'totalValue', 'createdAt', 'updatedAt'];
      if (validSortFields.includes(mappedField)) {
        queryBuilder.orderBy(`contract.${mappedField}`, sortOrder);
      } else {
        queryBuilder.orderBy('contract.createdAt', 'DESC');
      }
    } else {
      queryBuilder.orderBy('contract.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['payments'],
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return contract;
  }

  async update(id: string, updateDto: UpdateContractDto): Promise<Contract> {
    const contract = await this.findOne(id);

    if (updateDto.contract_number && updateDto.contract_number !== contract.contractNumber) {
      const existing = await this.contractRepository.findOne({
        where: { contractNumber: updateDto.contract_number },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Contract with number ${updateDto.contract_number} already exists`,
        );
      }
    }

    Object.assign(contract, {
      ...(updateDto.contract_number && { contractNumber: updateDto.contract_number }),
      ...(updateDto.contract_name && { contractName: updateDto.contract_name }),
      ...(updateDto.contract_type && { contractType: updateDto.contract_type }),
      ...(updateDto.status && { status: updateDto.status }),
      ...(updateDto.party_type && { partyType: updateDto.party_type }),
      ...(updateDto.party_id && { partyId: updateDto.party_id }),
      ...(updateDto.start_date && { startDate: new Date(updateDto.start_date) }),
      ...(updateDto.end_date !== undefined && { endDate: updateDto.end_date ? new Date(updateDto.end_date) : null }),
      ...(updateDto.total_value !== undefined && { totalValue: updateDto.total_value }),
      ...(updateDto.currency && { currency: updateDto.currency }),
      ...(updateDto.payment_terms !== undefined && { paymentTerms: updateDto.payment_terms }),
      ...(updateDto.billing_frequency !== undefined && { billingFrequency: updateDto.billing_frequency }),
      ...(updateDto.auto_renew !== undefined && { autoRenew: updateDto.auto_renew }),
      ...(updateDto.renewal_date !== undefined && { renewalDate: updateDto.renewal_date ? new Date(updateDto.renewal_date) : null }),
      ...(updateDto.project_id !== undefined && { projectId: updateDto.project_id }),
      ...(updateDto.cost_center_id !== undefined && { costCenterId: updateDto.cost_center_id }),
      ...(updateDto.notes !== undefined && { notes: updateDto.notes }),
      ...(updateDto.document_url !== undefined && { documentUrl: updateDto.document_url }),
    });

    return await this.contractRepository.save(contract);
  }

  async remove(id: string): Promise<void> {
    const contract = await this.findOne(id);
    
    // Delete associated payments
    await this.contractPaymentRepository.delete({ contractId: id });
    
    await this.contractRepository.remove(contract);
  }

  async activate(id: string, activateDto: ActivateContractDto): Promise<Contract> {
    const contract = await this.findOne(id);

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException(
        `Only draft contracts can be activated. Current status: ${contract.status}`,
      );
    }

    contract.status = ContractStatus.ACTIVE;
    contract.activationDate = activateDto.activation_date 
      ? new Date(activateDto.activation_date) 
      : new Date();

    return await this.contractRepository.save(contract);
  }

  async renew(id: string, renewDto: RenewContractDto): Promise<Contract> {
    const contract = await this.findOne(id);

    if (contract.status === ContractStatus.TERMINATED) {
      throw new BadRequestException('Terminated contracts cannot be renewed');
    }

    const oldEndDate = contract.endDate;
    contract.endDate = new Date(renewDto.new_end_date);
    contract.renewalDate = new Date();
    contract.status = ContractStatus.RENEWED;

    if (renewDto.updated_value !== undefined) {
      contract.totalValue = renewDto.updated_value;
    }

    // Create a new contract record for the renewal
    const renewedContract = this.contractRepository.create({
      organizationId: contract.organizationId,
      contractNumber: `${contract.contractNumber}-RENEWED-${Date.now()}`,
      contractName: contract.contractName,
      contractType: contract.contractType,
      status: ContractStatus.ACTIVE,
      partyType: contract.partyType,
      partyId: contract.partyId,
      partyName: contract.partyName,
      startDate: oldEndDate ? new Date(oldEndDate) : new Date(),
      endDate: new Date(renewDto.new_end_date),
      totalValue: renewDto.updated_value || contract.totalValue,
      currency: contract.currency,
      paymentTerms: contract.paymentTerms,
      billingFrequency: contract.billingFrequency,
      autoRenew: contract.autoRenew,
      renewalDate: new Date(renewDto.new_end_date),
      projectId: contract.projectId,
      costCenterId: contract.costCenterId,
      notes: renewDto.renewal_terms || contract.notes,
      documentUrl: contract.documentUrl,
    });

    await this.contractRepository.save(contract);
    return await this.contractRepository.save(renewedContract);
  }

  async terminate(id: string, terminateDto: TerminateContractDto): Promise<Contract> {
    const contract = await this.findOne(id);

    if (contract.status === ContractStatus.TERMINATED) {
      throw new BadRequestException('Contract is already terminated');
    }

    contract.status = ContractStatus.TERMINATED;
    contract.terminationDate = new Date(terminateDto.termination_date);
    contract.terminationReason = terminateDto.termination_reason;
    if (terminateDto.notes) {
      contract.notes = terminateDto.notes;
    }

    return await this.contractRepository.save(contract);
  }

  async getPayments(id: string): Promise<any> {
    const contract = await this.findOne(id);

    const payments = await this.contractPaymentRepository.find({
      where: { contractId: id },
      order: { paymentDate: 'ASC' },
    });

    const paidAmount = payments
      .filter((p) => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

    const outstandingAmount = contract.totalValue - paidAmount;

    return {
      contract_id: contract.id,
      contract_name: contract.contractName,
      total_value: contract.totalValue,
      paid_amount: paidAmount,
      outstanding_amount: outstandingAmount,
      payments: payments.map((payment) => ({
        payment_id: payment.id,
        payment_date: payment.paymentDate instanceof Date
          ? payment.paymentDate.toISOString().split('T')[0]
          : (payment.paymentDate || ''),
        amount: parseFloat(payment.amount.toString()),
        status: payment.status,
        due_date: payment.dueDate instanceof Date
          ? payment.dueDate.toISOString().split('T')[0]
          : (payment.dueDate || ''),
      })),
    };
  }

  private mapSortField(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'contract_number': 'contractNumber',
      'contract_name': 'contractName',
      'contract_type': 'contractType',
      'start_date': 'startDate',
      'end_date': 'endDate',
      'total_value': 'totalValue',
      'created_at': 'createdAt',
    };

    return fieldMap[field] || field;
  }
}

