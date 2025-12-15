import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PartsService } from './parts.service';
import { Metadata } from '@grpc/grpc-js';
import type {
  CreatePartRequest,
  UpdatePartRequest,
  PaginationRequest,
  FindOnePartRequest,
  DeletePartRequest,
  BulkDeleteRequest,
  BulkUpdateRequest,
  PartResponse,
  PaginatedPartsResponse,
  DeletePartResponse,
  BulkDeleteResponse,
  BulkUpdateResponse,
} from '@app/common/types/parts';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkUpdatePartDto } from './dto/bulk-update.dto';

@Controller()
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @GrpcMethod('PartService', 'CreatePart')
  async createPart(
    data: CreatePartRequest,
    metadata: Metadata,
  ): Promise<PartResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const createPartDto = this.mapCreateRequestToDto(data);
      const result = await this.partsService.create(createPartDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error('Error in Desk PartsController.createPart:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred',
      });
    }
  }

  @GrpcMethod('PartService', 'FindAllParts')
  async findAllParts(data: PaginationRequest): Promise<PaginatedPartsResponse> {
    try {
      const page = data.page && typeof data.page === 'number' ? data.page : Number(data.page) || 1;
      const limit = data.limit && typeof data.limit === 'number' ? data.limit : Number(data.limit) || 10;
      
      const paginationDto: PaginationQueryDto = {
        page: Math.max(1, page),
        limit: Math.max(1, Math.min(100, limit)),
      };
      const result = await this.partsService.findAll(paginationDto);
      
      if (!result || !result.data || !Array.isArray(result.data)) {
        console.error('Invalid result from PartsService.findAll:', result);
        return {
          data: [],
          total: result?.total || 0,
          page: result?.page || page,
          lastPage: result?.lastPage || 0,
        };
      }
      
      return {
        data: result.data.map(part => this.mapResponseDtoToProto(part)),
        total: result.total || 0,
        page: result.page || page,
        lastPage: result.lastPage || 0,
      };
    } catch (error) {
      console.error('Error in findAllParts:', error);
      throw new RpcException({
        code: 13,
        message: `Failed to fetch parts: ${error.message}`,
      });
    }
  }

  @GrpcMethod('PartService', 'FindOnePart')
  async findOnePart(data: FindOnePartRequest): Promise<PartResponse> {
    try {
      const result = await this.partsService.findOne(data.id);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in Desk PartsController.findOnePart for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during findOnePart for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('PartService', 'UpdatePart')
  async updatePart(
    data: UpdatePartRequest,
    metadata: Metadata,
  ): Promise<PartResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const updatePartDto = this.mapUpdateRequestToDto(data);
      const result = await this.partsService.update(data.id, updatePartDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in Desk PartsController.updatePart for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during updatePart for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('PartService', 'DeletePart')
  async deletePart(data: DeletePartRequest): Promise<DeletePartResponse> {
    try {
      await this.partsService.remove(data.id);
      return { success: true, message: 'Part deleted successfully' };
    } catch (error) {
      console.error(`Error in Desk PartsController.deletePart for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during deletePart for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('PartService', 'BulkDeleteParts')
  async bulkDeleteParts(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    try {
      const bulkDeleteDto: BulkDeleteDto = { ids: data.ids };
      const result = await this.partsService.bulkRemove(bulkDeleteDto);
      return {
        deleted_count: result.deletedCount,
        failed_ids: result.failedIds || [],
      };
    } catch (error) {
      console.error('Error in Desk PartsController.bulkDeleteParts:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkDeleteParts',
      });
    }
  }

  @GrpcMethod('PartService', 'BulkUpdateParts')
  async bulkUpdateParts(
    data: BulkUpdateRequest,
    metadata: Metadata,
  ): Promise<BulkUpdateResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const bulkUpdateDto: BulkUpdatePartDto = {
        ids: data.ids,
        updateFields: this.mapUpdateFieldsToDto(data.update_fields),
      };
      const result = await this.partsService.bulkUpdate(bulkUpdateDto, currentUser);
      return {
        updated_count: result.updatedCount,
        failed_items: result.failedItems || [],
      };
    } catch (error) {
      console.error('Error in Desk PartsController.bulkUpdateParts:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkUpdateParts',
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

  private mapCreateRequestToDto(data: CreatePartRequest): CreatePartDto {
    if (!data.name || data.price === undefined) {
      throw new RpcException({
        code: 3,
        message: 'Required fields missing: name and price are required',
      });
    }

    return {
      name: data.name,
      price: data.price,
    };
  }

  private mapUpdateRequestToDto(data: UpdatePartRequest): UpdatePartDto {
    const dto: UpdatePartDto = {};

    if (data.name !== undefined) dto.name = data.name;
    if (data.price !== undefined) dto.price = data.price;

    return dto;
  }

  private mapUpdateFieldsToDto(fields: any): UpdatePartDto {
    const dto: UpdatePartDto = {};

    if (fields.name !== undefined) dto.name = fields.name;
    if (fields.price !== undefined) dto.price = fields.price;

    return dto;
  }

  private mapResponseDtoToProto(dto: any): PartResponse {
    return {
      id: dto.id,
      name: dto.name,
      price: dto.price,
      created_at: dto.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: dto.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
}
