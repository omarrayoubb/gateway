import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ServicesService } from './services.service';
import { Metadata } from '@grpc/grpc-js';
import type {
  CreateServiceRequest,
  UpdateServiceRequest,
  PaginationRequest,
  FindOneServiceRequest,
  DeleteServiceRequest,
  BulkDeleteRequest,
  BulkUpdateRequest,
  ServiceResponse,
  PaginatedServicesResponse,
  DeleteServiceResponse,
  BulkDeleteResponse,
  BulkUpdateResponse,
} from '@app/common/types/services';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkUpdateServiceDto } from './dto/bulk-update.dto';

@Controller()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @GrpcMethod('ServiceService', 'CreateService')
  async createService(
    data: CreateServiceRequest,
    metadata: Metadata,
  ): Promise<ServiceResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const createServiceDto = this.mapCreateRequestToDto(data);
      const result = await this.servicesService.create(createServiceDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error('Error in Desk ServicesController.createService:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred',
      });
    }
  }

  @GrpcMethod('ServiceService', 'FindAllServices')
  async findAllServices(data: PaginationRequest): Promise<PaginatedServicesResponse> {
    try {
      const page = data.page && typeof data.page === 'number' ? data.page : Number(data.page) || 1;
      const limit = data.limit && typeof data.limit === 'number' ? data.limit : Number(data.limit) || 10;
      
      const paginationDto: PaginationQueryDto = {
        page: Math.max(1, page),
        limit: Math.max(1, Math.min(100, limit)),
      };
      const result = await this.servicesService.findAll(paginationDto);
      
      if (!result || !result.data || !Array.isArray(result.data)) {
        console.error('Invalid result from ServicesService.findAll:', result);
        return {
          data: [],
          total: result?.total || 0,
          page: result?.page || page,
          lastPage: result?.lastPage || 0,
        };
      }
      
      return {
        data: result.data.map(service => this.mapResponseDtoToProto(service)),
        total: result.total || 0,
        page: result.page || page,
        lastPage: result.lastPage || 0,
      };
    } catch (error) {
      console.error('Error in findAllServices:', error);
      throw new RpcException({
        code: 13,
        message: `Failed to fetch services: ${error.message}`,
      });
    }
  }

  @GrpcMethod('ServiceService', 'FindOneService')
  async findOneService(data: FindOneServiceRequest): Promise<ServiceResponse> {
    try {
      const result = await this.servicesService.findOne(data.id);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in Desk ServicesController.findOneService for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during findOneService for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('ServiceService', 'UpdateService')
  async updateService(
    data: UpdateServiceRequest,
    metadata: Metadata,
  ): Promise<ServiceResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const updateServiceDto = this.mapUpdateRequestToDto(data);
      const result = await this.servicesService.update(data.id, updateServiceDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in Desk ServicesController.updateService for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during updateService for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('ServiceService', 'DeleteService')
  async deleteService(data: DeleteServiceRequest): Promise<DeleteServiceResponse> {
    try {
      await this.servicesService.remove(data.id);
      return { success: true, message: 'Service deleted successfully' };
    } catch (error) {
      console.error(`Error in Desk ServicesController.deleteService for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during deleteService for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('ServiceService', 'BulkDeleteServices')
  async bulkDeleteServices(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    try {
      const bulkDeleteDto: BulkDeleteDto = { ids: data.ids };
      const result = await this.servicesService.bulkRemove(bulkDeleteDto);
      return {
        deleted_count: result.deletedCount,
        failed_ids: result.failedIds || [],
      };
    } catch (error) {
      console.error('Error in Desk ServicesController.bulkDeleteServices:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkDeleteServices',
      });
    }
  }

  @GrpcMethod('ServiceService', 'BulkUpdateServices')
  async bulkUpdateServices(
    data: BulkUpdateRequest,
    metadata: Metadata,
  ): Promise<BulkUpdateResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const bulkUpdateDto: BulkUpdateServiceDto = {
        ids: data.ids,
        updateFields: this.mapUpdateFieldsToDto(data.update_fields),
      };
      const result = await this.servicesService.bulkUpdate(bulkUpdateDto, currentUser);
      return {
        updated_count: result.updatedCount,
        failed_items: result.failedItems || [],
      };
    } catch (error) {
      console.error('Error in Desk ServicesController.bulkUpdateServices:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkUpdateServices',
      });
    }
  }

  private extractUserFromMetadata(metadata: Metadata): { id: string; name: string; email: string } {
    const userId = metadata.get('user-id')[0] as string;
    const userName = metadata.get('user-name')[0] as string;
    const userEmail = metadata.get('user-email')[0] as string;

    if (!userId || !userName || !userEmail) {
      throw new RpcException({
        code: 16,
        message: 'User information missing from metadata',
      });
    }

    return {
      id: userId,
      name: userName,
      email: userEmail,
    };
  }

  private mapCreateRequestToDto(data: CreateServiceRequest): CreateServiceDto {
    if (!data.name || data.netPrice === undefined) {
      throw new RpcException({
        code: 3,
        message: 'Required fields missing: name and netPrice are required',
      });
    }

    return {
      name: data.name,
      netPrice: data.netPrice,
    };
  }

  private mapUpdateRequestToDto(data: UpdateServiceRequest): UpdateServiceDto {
    const dto: UpdateServiceDto = {};

    if (data.name !== undefined) dto.name = data.name;
    if (data.netPrice !== undefined) dto.netPrice = data.netPrice;

    return dto;
  }

  private mapUpdateFieldsToDto(fields: any): UpdateServiceDto {
    const dto: UpdateServiceDto = {};

    if (fields.name !== undefined) dto.name = fields.name;
    if (fields.netPrice !== undefined) dto.netPrice = fields.netPrice;

    return dto;
  }

  private mapResponseDtoToProto(dto: any): ServiceResponse {
    return {
      id: dto.id,
      name: dto.name,
      netPrice: dto.netPrice,
      created_at: dto.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: dto.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
}
