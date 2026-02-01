import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PayrollConfigurationsService } from './payroll-configurations.service';
import { CreatePayrollConfigurationDto } from './dto/create-payroll-configuration.dto';

@Controller()
export class PayrollConfigurationsGrpcController {
  constructor(private readonly payrollConfigurationsService: PayrollConfigurationsService) {}

  @GrpcMethod('PayrollConfigurationService', 'GetPayrollConfigurations')
  async getPayrollConfigurations() {
    try {
      const configurations = await this.payrollConfigurationsService.findAll();
      return {
        payrollConfigurations: configurations.map(config => this.mapPayrollConfigurationToProto(config)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get payroll configurations',
      });
    }
  }

  @GrpcMethod('PayrollConfigurationService', 'CreatePayrollConfiguration')
  async createPayrollConfiguration(data: any) {
    try {
      const createDto: CreatePayrollConfigurationDto = {
        name: data.name,
        payFrequency: data.payFrequency,
        payDay: data.payDay ? parseInt(data.payDay) : 1,
        taxRate: data.taxRate ? parseFloat(data.taxRate) : 0,
        deductionRules: data.deductionRules || undefined,
      };

      const configuration = await this.payrollConfigurationsService.create(createDto);
      return this.mapPayrollConfigurationToProto(configuration);
    } catch (error) {
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create payroll configuration',
      });
    }
  }

  private mapPayrollConfigurationToProto(configuration: any) {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: configuration.id,
      name: configuration.name,
      payFrequency: configuration.payFrequency,
      payDay: configuration.payDay,
      taxRate: configuration.taxRate ? parseFloat(configuration.taxRate.toString()) : 0,
      deductionRules: configuration.deductionRules || {},
      createdAt: formatDateTime(configuration.createdAt),
    };
  }
}
