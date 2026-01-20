import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractPaginationDto } from './dto/pagination.dto';
import { ActivateContractDto } from './dto/activate-contract.dto';
import { RenewContractDto } from './dto/renew-contract.dto';
import { TerminateContractDto } from './dto/terminate-contract.dto';

@Controller()
export class ContractsGrpcController {
  constructor(private readonly contractsService: ContractsService) {}

  @GrpcMethod('ContractsService', 'GetContracts')
  async getContracts(data: any) {
    try {
      const paginationDto: ContractPaginationDto = {
        sort: data.sort,
        status: data.status,
        contract_type: data.contractType,
        customer_id: data.customerId,
        vendor_id: data.vendorId,
        start_date: data.startDate,
        end_date: data.endDate,
      };

      const contracts = await this.contractsService.findAll(paginationDto);
      return {
        contracts: contracts.map((contract) => this.mapContractToProto(contract)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get contracts',
      });
    }
  }

  @GrpcMethod('ContractsService', 'GetContract')
  async getContract(data: { id: string }) {
    try {
      const contract = await this.contractsService.findOne(data.id);
      return this.mapContractToProto(contract);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get contract',
      });
    }
  }

  @GrpcMethod('ContractsService', 'CreateContract')
  async createContract(data: any) {
    try {
      // Validate required fields
      if (!data.contractType) {
        throw new RpcException({
          code: 3,
          message: 'contract_type is required',
        });
      }

      const createDto: CreateContractDto = {
        organization_id: data.organizationId || '',
        contract_number: data.contractNumber,
        contract_name: data.contractName,
        contract_type: data.contractType,
        party_type: data.partyType || undefined,
        party_id: data.partyId || undefined,
        start_date: data.startDate,
        end_date: data.endDate || undefined,
        total_value: data.totalValue ? parseFloat(data.totalValue) : undefined,
        currency: data.currency || undefined,
        payment_terms: data.paymentTerms || undefined,
        billing_frequency: data.billingFrequency || undefined,
        auto_renew: data.autoRenew !== undefined ? data.autoRenew : undefined,
        renewal_date: data.renewalDate || undefined,
        project_id: data.projectId || undefined,
        cost_center_id: data.costCenterId || undefined,
        notes: data.notes || undefined,
        document_url: data.documentUrl || undefined,
      };

      const contract = await this.contractsService.create(createDto);
      return this.mapContractToProto(contract);
    } catch (error) {
      console.error('Error creating contract:', error);
      const errorMessage = error.message || error.toString() || 'Failed to create contract';
      throw new RpcException({
        code: 2,
        message: errorMessage,
      });
    }
  }

  @GrpcMethod('ContractsService', 'UpdateContract')
  async updateContract(data: any) {
    try {
      const updateDto: UpdateContractDto = {
        ...(data.contractNumber && { contract_number: data.contractNumber }),
        ...(data.contractName && { contract_name: data.contractName }),
        ...(data.contractType && { contract_type: data.contractType }),
        ...(data.status && { status: data.status }),
        ...(data.partyType && { party_type: data.partyType }),
        ...(data.partyId && { party_id: data.partyId }),
        ...(data.startDate && { start_date: data.startDate }),
        ...(data.endDate !== undefined && { end_date: data.endDate }),
        ...(data.totalValue !== undefined && { total_value: parseFloat(data.totalValue) }),
        ...(data.currency && { currency: data.currency }),
        ...(data.paymentTerms !== undefined && { payment_terms: data.paymentTerms }),
        ...(data.billingFrequency !== undefined && { billing_frequency: data.billingFrequency }),
        ...(data.autoRenew !== undefined && { auto_renew: data.autoRenew }),
        ...(data.renewalDate !== undefined && { renewal_date: data.renewalDate }),
        ...(data.projectId !== undefined && { project_id: data.projectId }),
        ...(data.costCenterId !== undefined && { cost_center_id: data.costCenterId }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.documentUrl !== undefined && { document_url: data.documentUrl }),
      };

      const contract = await this.contractsService.update(data.id, updateDto);
      return this.mapContractToProto(contract);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to update contract',
      });
    }
  }

  @GrpcMethod('ContractsService', 'DeleteContract')
  async deleteContract(data: { id: string }) {
    try {
      await this.contractsService.remove(data.id);
      return { success: true, message: 'Contract deleted successfully' };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to delete contract',
      });
    }
  }

  @GrpcMethod('ContractsService', 'ActivateContract')
  async activateContract(data: any) {
    try {
      const activateDto: ActivateContractDto = {
        activation_date: data.activationDate || undefined,
      };

      const contract = await this.contractsService.activate(data.id, activateDto);
      return {
        success: true,
        message: 'Contract activated successfully',
        contract: this.mapContractToProto(contract),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to activate contract',
      });
    }
  }

  @GrpcMethod('ContractsService', 'RenewContract')
  async renewContract(data: any) {
    try {
      const renewDto: RenewContractDto = {
        new_end_date: data.newEndDate,
        renewal_terms: data.renewalTerms || undefined,
        updated_value: data.updatedValue ? parseFloat(data.updatedValue) : undefined,
      };

      const contract = await this.contractsService.renew(data.id, renewDto);
      return {
        success: true,
        message: 'Contract renewed successfully',
        contract: this.mapContractToProto(contract),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to renew contract',
      });
    }
  }

  @GrpcMethod('ContractsService', 'TerminateContract')
  async terminateContract(data: any) {
    try {
      const terminateDto: TerminateContractDto = {
        termination_date: data.terminationDate,
        termination_reason: data.terminationReason,
        notes: data.notes || undefined,
      };

      const contract = await this.contractsService.terminate(data.id, terminateDto);
      return {
        success: true,
        message: 'Contract terminated successfully',
        contract: this.mapContractToProto(contract),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to terminate contract',
      });
    }
  }

  @GrpcMethod('ContractsService', 'GetContractPayments')
  async getContractPayments(data: { id: string }) {
    try {
      const result = await this.contractsService.getPayments(data.id);
      return {
        contractId: result.contract_id,
        contractName: result.contract_name,
        totalValue: result.total_value.toString(),
        paidAmount: result.paid_amount.toString(),
        outstandingAmount: result.outstanding_amount.toString(),
        payments: result.payments.map((payment: any) => ({
          paymentId: payment.payment_id,
          paymentDate: payment.payment_date,
          amount: payment.amount.toString(),
          status: payment.status,
          dueDate: payment.due_date,
        })),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get contract payments',
      });
    }
  }

  private mapContractToProto(contract: any) {
    return {
      id: contract.id,
      organizationId: contract.organizationId || '',
      contractNumber: contract.contractNumber,
      contractName: contract.contractName,
      contractType: contract.contractType,
      status: contract.status,
      partyType: contract.partyType,
      partyId: contract.partyId,
      partyName: contract.partyName || '',
      startDate: contract.startDate instanceof Date
        ? contract.startDate.toISOString().split('T')[0]
        : (contract.startDate || ''),
      endDate: contract.endDate instanceof Date
        ? contract.endDate.toISOString().split('T')[0]
        : (contract.endDate || ''),
      totalValue: contract.totalValue.toString(),
      currency: contract.currency,
      paymentTerms: contract.paymentTerms || '',
      billingFrequency: contract.billingFrequency || '',
      autoRenew: contract.autoRenew,
      renewalDate: contract.renewalDate instanceof Date
        ? contract.renewalDate.toISOString().split('T')[0]
        : (contract.renewalDate || ''),
      projectId: contract.projectId || '',
      costCenterId: contract.costCenterId || '',
      notes: contract.notes || '',
      documentUrl: contract.documentUrl || '',
      createdAt: contract.createdAt instanceof Date
        ? contract.createdAt.toISOString()
        : (contract.createdAt || ''),
    };
  }
}

