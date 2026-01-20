import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { LiabilitiesService } from './liabilities.service';
import { CreateLiabilityDto } from './dto/create-liability.dto';
import { UpdateLiabilityDto } from './dto/update-liability.dto';
import { LiabilityPaginationDto } from './dto/pagination.dto';
import { LiabilityType } from './entities/liability.entity';

@Controller()
export class LiabilitiesGrpcController {
  constructor(private readonly liabilitiesService: LiabilitiesService) {}

  @GrpcMethod('LiabilitiesService', 'GetLiabilities')
  async getLiabilities(data: any) {
    try {
      const paginationDto: LiabilityPaginationDto = {
        sort: data.sort,
        liability_type: data.liabilityType,
      };

      const liabilities = await this.liabilitiesService.findAll(paginationDto);
      return {
        liabilities: liabilities.map((liability) => this.mapLiabilityToProto(liability)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get liabilities',
      });
    }
  }

  @GrpcMethod('LiabilitiesService', 'GetLiability')
  async getLiability(data: { id: string }) {
    try {
      const liability = await this.liabilitiesService.findOne(data.id);
      return this.mapLiabilityToProto(liability);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get liability',
      });
    }
  }

  @GrpcMethod('LiabilitiesService', 'CreateLiability')
  async createLiability(data: any) {
    try {
      const createDto: CreateLiabilityDto = {
        organization_id: data.organizationId,
        liability_code: data.liabilityCode,
        liability_name: data.liabilityName,
        liability_type: data.liabilityType,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        currency: data.currency,
        due_date: data.dueDate,
        interest_rate: data.interestRate ? parseFloat(data.interestRate) : undefined,
        account_id: data.accountId,
      };

      const liability = await this.liabilitiesService.create(createDto);
      return this.mapLiabilityToProto(liability);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to create liability',
      });
    }
  }

  @GrpcMethod('LiabilitiesService', 'UpdateLiability')
  async updateLiability(data: any) {
    try {
      const updateDto: UpdateLiabilityDto = {
        ...(data.liabilityCode && { liability_code: data.liabilityCode }),
        ...(data.liabilityName && { liability_name: data.liabilityName }),
        ...(data.liabilityType && { liability_type: data.liabilityType }),
        ...(data.amount !== undefined && { amount: parseFloat(data.amount) }),
        ...(data.currency && { currency: data.currency }),
        ...(data.dueDate && { due_date: data.dueDate }),
        ...(data.interestRate !== undefined && { interest_rate: parseFloat(data.interestRate) }),
        ...(data.accountId && { account_id: data.accountId }),
        ...(data.status && { status: data.status }),
      };

      const liability = await this.liabilitiesService.update(data.id, updateDto);
      return this.mapLiabilityToProto(liability);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to update liability',
      });
    }
  }

  @GrpcMethod('LiabilitiesService', 'DeleteLiability')
  async deleteLiability(data: { id: string }) {
    try {
      await this.liabilitiesService.remove(data.id);
      return { success: true, message: 'Liability deleted successfully' };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to delete liability',
      });
    }
  }

  @GrpcMethod('LiabilitiesService', 'GetLongTermLiabilities')
  async getLongTermLiabilities() {
    try {
      const liabilities = await this.liabilitiesService.findByType(LiabilityType.LONG_TERM);
      return {
        liabilities: liabilities.map((liability) => this.mapLiabilityToProto(liability)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get long-term liabilities',
      });
    }
  }

  @GrpcMethod('LiabilitiesService', 'GetShortTermLiabilities')
  async getShortTermLiabilities() {
    try {
      const liabilities = await this.liabilitiesService.findByType(LiabilityType.SHORT_TERM);
      return {
        liabilities: liabilities.map((liability) => this.mapLiabilityToProto(liability)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get short-term liabilities',
      });
    }
  }

  private mapLiabilityToProto(liability: any) {
    return {
      id: liability.id,
      organizationId: liability.organizationId || '',
      liabilityCode: liability.liabilityCode,
      liabilityName: liability.liabilityName,
      liabilityType: liability.liabilityType,
      amount: liability.amount.toString(),
      currency: liability.currency,
      dueDate: liability.dueDate instanceof Date
        ? liability.dueDate.toISOString().split('T')[0]
        : (liability.dueDate || ''),
      interestRate: liability.interestRate.toString(),
      status: liability.status,
      accountId: liability.accountId || '',
    };
  }
}

