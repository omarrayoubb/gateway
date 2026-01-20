import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { VendorPayment, VendorPaymentStatus, VendorPaymentMethod } from './entities/vendor-payment.entity';
import { VendorPaymentAllocation } from './payment-allocations/entities/vendor-payment-allocation.entity';
import { CreateVendorPaymentDto } from './dto/create-vendor-payment.dto';
import { VendorPaymentPaginationDto } from './dto/pagination.dto';
import { PurchaseBill } from '../purchase-bills/entities/purchase-bill.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { GeneralLedgerService } from '../general-ledger/general-ledger.service';
import { TransactionType } from '../general-ledger/entities/general-ledger.entity';

@Injectable()
export class VendorPaymentsService {
  constructor(
    @InjectRepository(VendorPayment)
    private readonly vendorPaymentRepository: Repository<VendorPayment>,
    @InjectRepository(VendorPaymentAllocation)
    private readonly paymentAllocationRepository: Repository<VendorPaymentAllocation>,
    @InjectRepository(PurchaseBill)
    private readonly purchaseBillRepository: Repository<PurchaseBill>,
    private readonly organizationsService: OrganizationsService,
    private readonly generalLedgerService: GeneralLedgerService,
  ) {}

  async create(createPaymentDto: CreateVendorPaymentDto): Promise<VendorPayment> {
    try {
      // Validate required fields
      if (!createPaymentDto.vendor_id) {
        throw new BadRequestException('vendor_id is required');
      }
      if (!createPaymentDto.payment_date) {
        throw new BadRequestException('payment_date is required');
      }
      if (!createPaymentDto.payment_method) {
        throw new BadRequestException('payment_method is required');
      }

      // Auto-fetch organization_id if not provided
      let organizationId: string | null = createPaymentDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations && organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      // Calculate amount from allocations if not provided
      let amount = createPaymentDto.amount || 0;
      if (createPaymentDto.allocations && createPaymentDto.allocations.length > 0) {
        const calculatedAmount = createPaymentDto.allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
        if (amount === 0) {
          amount = calculatedAmount;
        } else if (amount !== calculatedAmount) {
          throw new BadRequestException('Payment amount must match total allocation amount');
        }
      }

      if (amount <= 0) {
        throw new BadRequestException('amount is required and must be greater than 0');
      }

      // Generate payment number if not provided
      let paymentNumber = createPaymentDto.payment_number;
      if (!paymentNumber) {
        paymentNumber = await this.generatePaymentNumber(organizationId);
      }

      // Check for duplicate payment number
      const existingPayment = await this.vendorPaymentRepository.findOne({
        where: {
          paymentNumber: paymentNumber,
          organizationId: organizationId === null ? IsNull() : organizationId,
        },
      });
      if (existingPayment) {
        throw new ConflictException(`Payment with number ${paymentNumber} already exists`);
      }

      // Validate allocations if provided
      if (createPaymentDto.allocations && createPaymentDto.allocations.length > 0) {
        for (const allocation of createPaymentDto.allocations) {
          // Verify purchase bill exists
          const bill = await this.purchaseBillRepository.findOne({
            where: { id: allocation.bill_id },
          });
          if (!bill) {
            throw new NotFoundException(`Purchase bill with ID ${allocation.bill_id} not found`);
          }

          if (allocation.amount <= 0) {
            throw new BadRequestException('Allocation amount must be greater than 0');
          }
        }
      }

      const payment = this.vendorPaymentRepository.create({
        organizationId: organizationId,
        paymentNumber: paymentNumber,
        vendorId: createPaymentDto.vendor_id,
        vendorName: createPaymentDto.vendor_id, // Will be populated from supply chain if needed
        paymentDate: new Date(createPaymentDto.payment_date),
        paymentMethod: createPaymentDto.payment_method,
        paymentReference: null,
        amount: amount,
        currency: createPaymentDto.currency || 'USD',
        status: VendorPaymentStatus.PENDING,
        bankAccountId: createPaymentDto.bank_account_id || null,
      });

      const savedPayment = await this.vendorPaymentRepository.save(payment);

      // Create allocations
      if (createPaymentDto.allocations && createPaymentDto.allocations.length > 0) {
        const allocations: VendorPaymentAllocation[] = [];
        for (const allocationDto of createPaymentDto.allocations) {
          const allocation = this.paymentAllocationRepository.create({
            vendorPaymentId: savedPayment.id,
            billId: allocationDto.bill_id,
            amount: allocationDto.amount,
          });

          allocations.push(allocation);
        }
        await this.paymentAllocationRepository.save(allocations);
      }

      return await this.findOne(savedPayment.id);
    } catch (error) {
      console.error('Error in VendorPaymentsService.create:', error);
      throw error;
    }
  }

  async findAll(query: VendorPaymentPaginationDto): Promise<VendorPayment[]> {
    try {
      const queryBuilder = this.vendorPaymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.allocations', 'allocations');

      if (query.status) {
        queryBuilder.where('payment.status = :status', { status: query.status });
      }

      if (query.vendor_id) {
        const whereCondition = query.status ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('payment.vendorId = :vendorId', { vendorId: query.vendor_id });
      }

      // Apply sorting
      if (query.sort) {
        let sortField = query.sort.trim();
        let sortOrder: 'ASC' | 'DESC' = 'ASC';

        if (sortField.startsWith('-')) {
          sortField = sortField.substring(1).trim();
          sortOrder = 'DESC';
        } else if (sortField.includes(':')) {
          const [field, order] = sortField.split(':');
          sortField = field.trim();
          sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        }

        const fieldMap: { [key: string]: string } = {
          'payment_date': 'paymentDate',
          'payment_number': 'paymentNumber',
          'amount': 'amount',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`payment.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('payment.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('payment.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('payment.createdDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in VendorPaymentsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<VendorPayment> {
    const payment = await this.vendorPaymentRepository.findOne({
      where: { id },
      relations: ['allocations'],
    });
    if (!payment) {
      throw new NotFoundException(`Vendor payment with ID ${id} not found`);
    }
    return payment;
  }

  async process(id: string): Promise<VendorPayment> {
    const payment = await this.findOne(id);

    if (payment.status === VendorPaymentStatus.PROCESSED) {
      throw new BadRequestException('Payment is already processed');
    }

    if (payment.status === VendorPaymentStatus.CANCELLED) {
      throw new BadRequestException('Cannot process a cancelled payment');
    }

    // Update payment status
    payment.status = VendorPaymentStatus.PROCESSED;

    // Update purchase bills with allocations
    if (payment.allocations && payment.allocations.length > 0) {
      for (const allocation of payment.allocations) {
        const bill = await this.purchaseBillRepository.findOne({
          where: { id: allocation.billId },
        });
        if (bill) {
          bill.paidAmount = (bill.paidAmount || 0) + allocation.amount;
          bill.balanceDue = Math.max(0, bill.totalAmount - bill.paidAmount);

          if (bill.balanceDue <= 0) {
            bill.status = 'paid' as any;
          }

          await this.purchaseBillRepository.save(bill);
        }
      }
    }

    await this.vendorPaymentRepository.save(payment);

    // Sync to general ledger when payment is processed
    try {
      await this.generalLedgerService.syncVendorPaymentToLedger(
        payment.id,
        payment.paymentDate,
        payment.amount,
        payment.bankAccountId || undefined,
      );
    } catch (error) {
      console.error('Error syncing vendor payment to general ledger:', error);
      // Don't fail the process operation if ledger sync fails
    }

    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);

    if (payment.status === VendorPaymentStatus.PROCESSED) {
      throw new BadRequestException('Cannot delete a processed payment');
    }

    // Remove from general ledger if it was synced
    try {
      await this.generalLedgerService.removeTransactionFromLedger(id, TransactionType.PAYMENT);
    } catch (error) {
      console.error('Error removing vendor payment from general ledger:', error);
      // Continue with deletion even if ledger removal fails
    }

    await this.vendorPaymentRepository.remove(payment);
  }

  private async generatePaymentNumber(organizationId: string | null): Promise<string> {
    const prefix = 'VP';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const queryBuilder = this.vendorPaymentRepository
      .createQueryBuilder('payment')
      .where('payment.paymentNumber LIKE :pattern', { pattern: `${prefix}-${year}${month}-%` });

    if (organizationId) {
      queryBuilder.andWhere('payment.organizationId = :organizationId', { organizationId });
    } else {
      queryBuilder.andWhere('payment.organizationId IS NULL');
    }

    queryBuilder.orderBy('payment.paymentNumber', 'DESC').limit(1);

    const lastPayment = await queryBuilder.getOne();

    let sequence = 1;
    if (lastPayment && lastPayment.paymentNumber) {
      const parts = lastPayment.paymentNumber.split('-');
      if (parts.length === 3) {
        const lastSequence = parseInt(parts[2]);
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }
    }

    return `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }
}

