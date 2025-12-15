import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller()
export class ServicesGrpcController {
  constructor(private readonly servicesService: ServicesService) {}

  @GrpcMethod('ServicesService', 'GetService')
  async getService(data: { id: string }) {
    const services = await this.servicesService.findAll();
    const service = services.find(s => s.id === data.id);
    if (!service) {
      throw new Error('Service not found');
    }
    return this.mapServiceToProto(service);
  }

  @GrpcMethod('ServicesService', 'GetServices')
  async getServices(data: { page?: number; limit?: number; search?: string }) {
    const services = await this.servicesService.findAll();
    return {
      services: services.map(service => this.mapServiceToProto(service)),
      total: services.length,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  }

  @GrpcMethod('ServicesService', 'CreateService')
  async createService(data: any) {
    // Services service doesn't have create method yet, return error
    throw new Error('Create service not implemented');
  }

  @GrpcMethod('ServicesService', 'UpdateService')
  async updateService(data: any) {
    // Services service doesn't have update method yet, return error
    throw new Error('Update service not implemented');
  }

  @GrpcMethod('ServicesService', 'DeleteService')
  async deleteService(data: { id: string }) {
    // Services service doesn't have remove method yet, return error
    throw new Error('Delete service not implemented');
  }

  private mapServiceToProto(service: any) {
    return {
      id: service.id,
      name: service.name || '',
      net_price: service.netPrice || 0,
      created_at: service.createdAt?.toISOString() || '',
      updated_at: service.updatedAt?.toISOString() || '',
    };
  }
}

