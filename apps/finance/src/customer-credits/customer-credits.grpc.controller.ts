import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CustomerCreditsService } from './customer-credits.service';
import { CustomerCreditPaginationDto } from './dto/pagination.dto';
import { CreateCustomerCreditDto } from './dto/create-customer-credit.dto';
import { UpdateCustomerCreditDto } from './dto/update-customer-credit.dto';
import { RiskLevel } from './entities/customer-credit.entity';

@Controller()
export class CustomerCreditsGrpcController {
  constructor(private readonly customerCreditsService: CustomerCreditsService) {}

  @GrpcMethod('CustomerCreditsService', 'GetCustomerCredits')
  async getCustomerCredits(data: { sort?: string; risk_level?: string }) {
    try {
      const query: CustomerCreditPaginationDto = {
        sort: data.sort,
        risk_level: data.risk_level as RiskLevel,
      };

      const credits = await this.customerCreditsService.findAll(query);
      return {
        credits: credits.map(credit => this.mapCreditToProto(credit)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get customer credits',
      });
    }
  }

  @GrpcMethod('CustomerCreditsService', 'GetCustomerCredit')
  async getCustomerCredit(data: { id: string }) {
    try {
      const credit = await this.customerCreditsService.findOne(data.id);
      return this.mapCreditToProto(credit);
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to get customer credit',
      });
    }
  }

  @GrpcMethod('CustomerCreditsService', 'CreateCustomerCredit')
  async createCustomerCredit(data: any) {
    try {
      const createDto: CreateCustomerCreditDto = {
        organization_id: data.organizationId || data.organization_id,
        customer_id: data.customerId || data.customer_id,
        customer_name: data.customerName || data.customer_name,
        credit_limit: parseFloat(data.creditLimit || data.credit_limit || '0'),
        current_balance: data.currentBalance !== undefined ? parseFloat(data.currentBalance.toString()) : undefined,
        credit_score: data.creditScore !== undefined ? parseInt(data.creditScore.toString()) : undefined,
        risk_level: data.riskLevel || data.risk_level ? (data.riskLevel || data.risk_level) as RiskLevel : undefined,
        on_time_payment_rate: data.onTimePaymentRate !== undefined ? parseFloat(data.onTimePaymentRate.toString()) : undefined,
        average_days_to_pay: data.averageDaysToPay !== undefined ? parseInt(data.averageDaysToPay.toString()) : undefined,
      };

      const credit = await this.customerCreditsService.create(createDto);
      return this.mapCreditToProto(credit);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create customer credit',
      });
    }
  }

  @GrpcMethod('CustomerCreditsService', 'UpdateCustomerCredit')
  async updateCustomerCredit(data: { id: string; [key: string]: any }) {
    try {
      const updateDto: UpdateCustomerCreditDto = {};
      
      if (data.organizationId !== undefined || data.organization_id !== undefined) {
        updateDto.organization_id = data.organizationId || data.organization_id;
      }
      if (data.customerId !== undefined || data.customer_id !== undefined) {
        updateDto.customer_id = data.customerId || data.customer_id;
      }
      if (data.customerName !== undefined || data.customer_name !== undefined) {
        updateDto.customer_name = data.customerName || data.customer_name;
      }
      if (data.creditLimit !== undefined || data.credit_limit !== undefined) {
        updateDto.credit_limit = parseFloat((data.creditLimit || data.credit_limit || '0').toString());
      }
      if (data.currentBalance !== undefined || data.current_balance !== undefined) {
        updateDto.current_balance = parseFloat((data.currentBalance || data.current_balance || '0').toString());
      }
      if (data.creditScore !== undefined || data.credit_score !== undefined) {
        updateDto.credit_score = parseInt((data.creditScore || data.credit_score || '0').toString());
      }
      if (data.riskLevel !== undefined || data.risk_level !== undefined) {
        updateDto.risk_level = (data.riskLevel || data.risk_level) as RiskLevel;
      }
      if (data.onTimePaymentRate !== undefined || data.on_time_payment_rate !== undefined) {
        updateDto.on_time_payment_rate = parseFloat((data.onTimePaymentRate || data.on_time_payment_rate || '0').toString());
      }
      if (data.averageDaysToPay !== undefined || data.average_days_to_pay !== undefined) {
        updateDto.average_days_to_pay = parseInt((data.averageDaysToPay || data.average_days_to_pay || '0').toString());
      }

      const credit = await this.customerCreditsService.update(data.id, updateDto);
      return this.mapCreditToProto(credit);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update customer credit',
      });
    }
  }

  @GrpcMethod('CustomerCreditsService', 'DeleteCustomerCredit')
  async deleteCustomerCredit(data: { id: string }) {
    try {
      await this.customerCreditsService.delete(data.id);
      return { success: true };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete customer credit',
      });
    }
  }

  @GrpcMethod('CustomerCreditsService', 'RecalculateBalance')
  async recalculateBalance(data: { customerId?: string; customer_id?: string }) {
    try {
      const credit = await this.customerCreditsService.recalculateBalance(
        data.customerId || data.customer_id || '',
      );
      return this.mapCreditToProto(credit);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to recalculate credit balance',
      });
    }
  }

  private mapCreditToProto(credit: any): any {
    return {
      id: credit.id,
      organizationId: credit.organizationId || '',
      customerId: credit.customerId || '',
      customerName: credit.customerName || '',
      creditLimit: credit.creditLimit ? credit.creditLimit.toString() : '0',
      currentBalance: credit.currentBalance ? credit.currentBalance.toString() : '0',
      availableCredit: credit.availableCredit ? credit.availableCredit.toString() : '0',
      creditScore: credit.creditScore || 0,
      riskLevel: credit.riskLevel,
      onTimePaymentRate: credit.onTimePaymentRate ? credit.onTimePaymentRate.toString() : '0',
      averageDaysToPay: credit.averageDaysToPay || 0,
    };
  }
}

