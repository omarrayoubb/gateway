import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { TaxPayablesService } from './tax-payables.service';
import { CreateTaxPayableDto } from './dto/create-tax-payable.dto';
import { UpdateTaxPayableDto } from './dto/update-tax-payable.dto';
import { TaxPayablePaginationDto } from './dto/pagination.dto';
import { PayTaxPayableDto } from './dto/pay-tax-payable.dto';
import { CalculateTaxDto } from './dto/calculate-tax.dto';

@Controller()
export class TaxPayablesGrpcController {
  constructor(private readonly taxPayablesService: TaxPayablesService) {}

  @GrpcMethod('TaxPayablesService', 'GetTaxPayables')
  async getTaxPayables(data: any) {
    try {
      const paginationDto: TaxPayablePaginationDto = {
        sort: data.sort,
        status: data.status,
        tax_type: data.taxType,
      };

      const taxPayables = await this.taxPayablesService.findAll(paginationDto);
      return {
        taxPayables: taxPayables.map((tax) => this.mapTaxPayableToProto(tax)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get tax payables',
      });
    }
  }

  @GrpcMethod('TaxPayablesService', 'GetTaxPayable')
  async getTaxPayable(data: { id: string }) {
    try {
      const taxPayable = await this.taxPayablesService.findOne(data.id);
      return this.mapTaxPayableToProto(taxPayable);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get tax payable',
      });
    }
  }

  @GrpcMethod('TaxPayablesService', 'CreateTaxPayable')
  async createTaxPayable(data: any) {
    try {
      const createDto: CreateTaxPayableDto = {
        organization_id: data.organizationId,
        tax_type: data.taxType,
        tax_period: data.taxPeriod,
        due_date: data.dueDate,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        currency: data.currency,
        account_id: data.accountId,
      };

      const taxPayable = await this.taxPayablesService.create(createDto);
      return this.mapTaxPayableToProto(taxPayable);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to create tax payable',
      });
    }
  }

  @GrpcMethod('TaxPayablesService', 'UpdateTaxPayable')
  async updateTaxPayable(data: any) {
    try {
      const updateDto: UpdateTaxPayableDto = {
        ...(data.taxType && { tax_type: data.taxType }),
        ...(data.taxPeriod && { tax_period: data.taxPeriod }),
        ...(data.dueDate && { due_date: data.dueDate }),
        ...(data.amount !== undefined && { amount: parseFloat(data.amount) }),
        ...(data.currency && { currency: data.currency }),
        ...(data.accountId && { account_id: data.accountId }),
        ...(data.status && { status: data.status }),
        ...(data.paidDate && { paid_date: data.paidDate }),
        ...(data.paidAmount !== undefined && { paid_amount: parseFloat(data.paidAmount) }),
      };

      const taxPayable = await this.taxPayablesService.update(data.id, updateDto);
      return this.mapTaxPayableToProto(taxPayable);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to update tax payable',
      });
    }
  }

  @GrpcMethod('TaxPayablesService', 'DeleteTaxPayable')
  async deleteTaxPayable(data: { id: string }) {
    try {
      await this.taxPayablesService.remove(data.id);
      return { success: true, message: 'Tax payable deleted successfully' };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to delete tax payable',
      });
    }
  }

  @GrpcMethod('TaxPayablesService', 'PayTaxPayable')
  async payTaxPayable(data: any) {
    try {
      const payDto: PayTaxPayableDto = {
        payment_date: data.paymentDate,
        payment_amount: parseFloat(data.paymentAmount),
        bank_account_id: data.bankAccountId,
      };

      const taxPayable = await this.taxPayablesService.pay(data.id, payDto);
      return this.mapTaxPayableToProto(taxPayable);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to pay tax payable',
      });
    }
  }

  @GrpcMethod('TaxPayablesService', 'CalculateTaxPayable')
  async calculateTax(data: any) {
    try {
      const calculateDto: CalculateTaxDto = {
        tax_type: data.taxType,
        period: data.period,
      };

      const result = await this.taxPayablesService.calculate(calculateDto);
      return {
        taxType: result.tax_type,
        period: result.period,
        calculatedAmount: result.calculated_amount.toString(),
        breakdown: {
          sales: result.breakdown.sales.toString(),
          purchases: result.breakdown.purchases.toString(),
          netTax: result.breakdown.net_tax.toString(),
        },
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to calculate tax',
      });
    }
  }

  private mapTaxPayableToProto(tax: any) {
    return {
      id: tax.id,
      organizationId: tax.organizationId || '',
      taxType: tax.taxType,
      taxPeriod: tax.taxPeriod,
      dueDate: tax.dueDate instanceof Date
        ? tax.dueDate.toISOString().split('T')[0]
        : tax.dueDate,
      amount: tax.amount.toString(),
      currency: tax.currency,
      status: tax.status,
      accountId: tax.accountId || '',
      paidDate: tax.paidDate instanceof Date
        ? tax.paidDate.toISOString().split('T')[0]
        : (tax.paidDate || ''),
    };
  }
}

