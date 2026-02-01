import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CustomPayrollComponentsService } from './custom-payroll-components.service';
import { CreateCustomPayrollComponentDto } from './dto/create-custom-payroll-component.dto';

@Controller()
export class CustomPayrollComponentsGrpcController {
  constructor(private readonly customPayrollComponentsService: CustomPayrollComponentsService) {}

  @GrpcMethod('CustomPayrollComponentService', 'GetCustomPayrollComponents')
  async getCustomPayrollComponents() {
    try {
      const components = await this.customPayrollComponentsService.findAll();
      return {
        customPayrollComponents: components.map(component => this.mapCustomPayrollComponentToProto(component)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get custom payroll components',
      });
    }
  }

  @GrpcMethod('CustomPayrollComponentService', 'CreateCustomPayrollComponent')
  async createCustomPayrollComponent(data: any) {
    try {
      const createDto: CreateCustomPayrollComponentDto = {
        name: data.name,
        type: data.type,
        amount: data.amount ? parseFloat(data.amount) : 0,
        appliesTo: data.appliesTo,
      };

      const component = await this.customPayrollComponentsService.create(createDto);
      return this.mapCustomPayrollComponentToProto(component);
    } catch (error) {
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create custom payroll component',
      });
    }
  }

  private mapCustomPayrollComponentToProto(component: any) {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: component.id,
      name: component.name,
      type: component.type,
      amount: component.amount ? parseFloat(component.amount.toString()) : 0,
      appliesTo: component.appliesTo,
      createdAt: formatDateTime(component.createdAt),
    };
  }
}
