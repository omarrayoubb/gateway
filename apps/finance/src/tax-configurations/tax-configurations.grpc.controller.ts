import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { TaxConfigurationsService } from './tax-configurations.service';
import { CreateTaxConfigurationDto } from './dto/create-tax-configuration.dto';
import { UpdateTaxConfigurationDto } from './dto/update-tax-configuration.dto';
import { TaxConfigurationPaginationDto } from './dto/pagination.dto';
import { CalculateTaxDto } from './dto/calculate-tax.dto';
import { TaxType, CalculationMethod } from './entities/tax-configuration.entity';

@Controller()
export class TaxConfigurationsGrpcController {
  constructor(private readonly taxConfigurationsService: TaxConfigurationsService) {}

  @GrpcMethod('TaxConfigurationsService', 'GetTaxConfigurations')
  async getTaxConfigurations(data: { tax_type?: string; is_active?: boolean; sort?: string }) {
    try {
      console.log('TaxConfigurationsGrpcController.getTaxConfigurations - Input:', data);
      const query: TaxConfigurationPaginationDto = {
        tax_type: data.tax_type as TaxType,
        is_active: data.is_active,
        sort: data.sort,
      };

      const taxConfigs = await this.taxConfigurationsService.findAll(query);
      console.log(`TaxConfigurationsGrpcController.getTaxConfigurations - Found ${taxConfigs.length} configurations`);
      
      const result = {
        taxConfigurations: taxConfigs.map(tax => this.mapTaxToProto(tax)),
      };
      
      console.log('TaxConfigurationsGrpcController.getTaxConfigurations - Returning result');
      return result;
    } catch (error) {
      console.error('TaxConfigurationsGrpcController.getTaxConfigurations - Error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        data: data,
      });
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get tax configurations',
      });
    }
  }

  @GrpcMethod('TaxConfigurationsService', 'GetTaxConfiguration')
  async getTaxConfiguration(data: { id: string }) {
    try {
      const taxConfig = await this.taxConfigurationsService.findOne(data.id);
      return this.mapTaxToProto(taxConfig);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get tax configuration',
      });
    }
  }

  @GrpcMethod('TaxConfigurationsService', 'CreateTaxConfiguration')
  async createTaxConfiguration(data: any) {
    try {
      const createDto: CreateTaxConfigurationDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        tax_code: data.taxCode || data.tax_code,
        tax_name: data.taxName || data.tax_name,
        tax_type: (data.taxType || data.tax_type) as TaxType,
        tax_rate: data.taxRate !== undefined ? parseFloat(data.taxRate) : undefined,
        calculation_method: (data.calculationMethod || data.calculation_method) as CalculationMethod,
        is_inclusive: data.isInclusive !== undefined ? data.isInclusive : (data.is_inclusive !== undefined ? data.is_inclusive : false),
        applies_to: data.appliesTo || data.applies_to || [],
        account_id: data.accountId || data.account_id,
        effective_from: data.effectiveFrom || data.effective_from || undefined,
        effective_to: data.effectiveTo || data.effective_to || undefined,
      };

      const taxConfig = await this.taxConfigurationsService.create(createDto);
      return this.mapTaxToProto(taxConfig);
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create tax configuration',
      });
    }
  }

  @GrpcMethod('TaxConfigurationsService', 'UpdateTaxConfiguration')
  async updateTaxConfiguration(data: any) {
    try {
      const updateDto: UpdateTaxConfigurationDto = {
        organization_id: data.organizationId || data.organization_id || undefined,
        tax_code: data.taxCode || data.tax_code || undefined,
        tax_name: data.taxName || data.tax_name || undefined,
        tax_type: data.taxType ? (data.taxType as TaxType) : undefined,
        tax_rate: data.taxRate !== undefined ? parseFloat(data.taxRate) : undefined,
        calculation_method: data.calculationMethod ? (data.calculationMethod as CalculationMethod) : undefined,
        is_inclusive: data.isInclusive !== undefined ? data.isInclusive : undefined,
        applies_to: data.appliesTo || data.applies_to || undefined,
        account_id: data.accountId || data.account_id || undefined,
        effective_from: data.effectiveFrom || data.effective_from || undefined,
        effective_to: data.effectiveTo || data.effective_to || undefined,
      };

      const taxConfig = await this.taxConfigurationsService.update(data.id, updateDto);
      return this.mapTaxToProto(taxConfig);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update tax configuration',
      });
    }
  }

  @GrpcMethod('TaxConfigurationsService', 'CalculateTax')
  async calculateTax(data: { amount: number; tax_code: string; date?: string; organization_id?: string }) {
    try {
      const calculateDto: CalculateTaxDto = {
        amount: parseFloat(data.amount.toString()),
        tax_code: data.tax_code,
        date: data.date || undefined,
      };

      const result = await this.taxConfigurationsService.calculateTax(calculateDto, data.organization_id);
      return {
        baseAmount: result.base_amount.toString(),
        taxCode: result.tax_code,
        taxRate: result.tax_rate.toString(),
        taxAmount: result.tax_amount.toString(),
        totalAmount: result.total_amount.toString(),
      };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : error.status === 400 ? 3 : 2,
        message: error.message || 'Failed to calculate tax',
      });
    }
  }

  @GrpcMethod('TaxConfigurationsService', 'DeleteTaxConfiguration')
  async deleteTaxConfiguration(data: { id: string }) {
    try {
      await this.taxConfigurationsService.remove(data.id);
      return { success: true, message: 'Tax configuration deleted' };
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to delete tax configuration',
      });
    }
  }

  private mapTaxToProto(tax: any): any {
    // Helper function to safely convert date to ISO string
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      if (typeof date === 'string') {
        // If it's already a string, try to parse it
        try {
          const parsedDate = new Date(date);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString().split('T')[0];
          }
        } catch (e) {
          // If parsing fails, return empty string
        }
        return date.split('T')[0]; // Return date part if it's already in ISO format
      }
      return '';
    };

    return {
      id: tax.id,
      organizationId: tax.organizationId || '',
      taxCode: tax.taxCode,
      taxName: tax.taxName,
      taxType: tax.taxType,
      taxRate: tax.taxRate ? tax.taxRate.toString() : '0',
      calculationMethod: tax.calculationMethod,
      isInclusive: tax.isInclusive !== undefined ? tax.isInclusive : false,
      appliesTo: tax.appliesTo || [],
      accountId: tax.accountId,
      isActive: tax.isActive !== undefined ? tax.isActive : true,
      effectiveFrom: formatDate(tax.effectiveFrom),
      effectiveTo: formatDate(tax.effectiveTo),
    };
  }
}

