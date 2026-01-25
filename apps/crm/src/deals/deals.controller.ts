import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { GrpcErrorMapper } from '../common';
import { DealsService } from './deals.service';
import { Metadata } from '@grpc/grpc-js';
import type {
  CreateDealRequest,
  UpdateDealRequest,
  PaginationRequest,
  FindOneDealRequest,
  DeleteDealRequest,
  BulkDeleteRequest,
  BulkUpdateRequest,
  DealResponse,
  PaginatedDealsResponse,
  DeleteDealResponse,
  BulkDeleteResponse,
  BulkUpdateResponse,
} from '@app/common/types/deals';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkUpdateDealDto } from './dto/bulk-update.dto';

@Controller()
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  /**
   * REQUEST/RESPONSE CYCLE - CreateDeal:
   * 1. Client sends gRPC CreateDealRequest via API Gateway
   * 2. API Gateway -> CRM Microservice (gRPC)
   * 3. This method receives request + user metadata
   * 4. Maps proto request to DTO
   * 5. Calls DealsService.create() with DTO + user context
   * 6. Service returns DealResponseDto
   * 7. Maps DTO to proto DealResponse
   * 8. Returns proto response to API Gateway
   * 9. API Gateway transforms to HTTP response
   */
  @GrpcMethod('DealsService', 'CreateDeal')
  async createDeal(
    data: CreateDealRequest,
    metadata: Metadata,
  ): Promise<DealResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const createDealDto = this.mapCreateRequestToDto(data);
      const result = await this.dealsService.create(createDealDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error('Error in CRM DealsController.createDeal:', error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  /**
   * REQUEST/RESPONSE CYCLE - FindAllDeals:
   * 1. Client sends HTTP GET /deals?page=1&limit=10 via API Gateway
   * 2. API Gateway -> CRM Microservice (gRPC PaginationRequest)
   * 3. This method receives pagination request
   * 4. Calls DealsService.findAll() with pagination DTO
   * 5. Service returns paginated DealResponseDto[]
   * 6. Maps DTOs to proto DealResponse[]
   * 7. Returns PaginatedDealsResponse to API Gateway
   * 8. API Gateway transforms to HTTP response with pagination metadata
   */
  @GrpcMethod('DealsService', 'FindAllDeals')
  async findAllDeals(data: PaginationRequest): Promise<PaginatedDealsResponse> {
    try {
      // Ensure page and limit are numbers with defaults
      const page = data.page && typeof data.page === 'number' ? data.page : Number(data.page) || 1;
      const limit = data.limit && typeof data.limit === 'number' ? data.limit : Number(data.limit) || 10;
      
      const paginationDto: PaginationQueryDto = {
        page: Math.max(1, page), // Ensure page is at least 1
        limit: Math.max(1, Math.min(100, limit)), // Ensure limit is between 1 and 100
      };
      const result = await this.dealsService.findAll(paginationDto);
      
      // Ensure result.data exists and is an array
      if (!result || !result.data || !Array.isArray(result.data)) {
        console.error('Invalid result from DealsService.findAll:', result);
        return {
          data: [],
          total: result?.total || 0,
          page: result?.page || page,
          lastPage: result?.lastPage || 0,
        };
      }
      
      return {
        data: result.data.map(deal => this.mapResponseDtoToProto(deal)),
        total: result.total || 0,
        page: result.page || page,
        lastPage: result.lastPage || 0,
      };
    } catch (error) {
      console.error('Error in findAllDeals:', error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('DealsService', 'FindOneDeal')
  async findOneDeal(data: FindOneDealRequest): Promise<DealResponse> {
    try {
      const result = await this.dealsService.findOne(data.id);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM DealsController.findOneDeal for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2, // UNKNOWN
        message: error.message || `An unknown error occurred during findOneDeal for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('DealsService', 'UpdateDeal')
  async updateDeal(
    data: UpdateDealRequest,
    metadata: Metadata,
  ): Promise<DealResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const updateDealDto = this.mapUpdateRequestToDto(data);
      const result = await this.dealsService.update(data.id, updateDealDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM DealsController.updateDeal for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2, // UNKNOWN
        message: error.message || `An unknown error occurred during updateDeal for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('DealsService', 'DeleteDeal')
  async deleteDeal(data: DeleteDealRequest): Promise<DeleteDealResponse> {
    try {
      await this.dealsService.remove(data.id);
      return { success: true };
    } catch (error) {
      console.error(`Error in CRM DealsController.deleteDeal for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2, // UNKNOWN
        message: error.message || `An unknown error occurred during deleteDeal for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('DealsService', 'BulkDeleteDeals')
  async bulkDeleteDeals(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    try {
      const bulkDeleteDto: BulkDeleteDto = { ids: data.ids };
      const result = await this.dealsService.bulkRemove(bulkDeleteDto);
      return {
        deletedCount: result.deletedCount,
        failedIds: result.failedIds || [],
      };
    } catch (error) {
      console.error('Error in CRM DealsController.bulkDeleteDeals:', error);
      throw new RpcException({
        code: error.code || 2, // UNKNOWN
        message: error.message || 'An unknown error occurred during bulkDeleteDeals',
      });
    }
  }

  @GrpcMethod('DealsService', 'BulkUpdateDeals')
  async bulkUpdateDeals(
    data: BulkUpdateRequest,
    metadata: Metadata,
  ): Promise<BulkUpdateResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const bulkUpdateDto: BulkUpdateDealDto = {
        ids: data.ids,
        updateFields: this.mapUpdateFieldsToDto(data.updateFields),
      };
      const result = await this.dealsService.bulkUpdate(bulkUpdateDto, currentUser);
      return {
        updatedCount: result.updatedCount,
        failedItems: result.failedItems || [],
      };
    } catch (error) {
      console.error('Error in CRM DealsController.bulkUpdateDeals:', error);
      throw new RpcException({
        code: error.code || 2, // UNKNOWN
        message: error.message || 'An unknown error occurred during bulkUpdateDeals',
      });
    }
  }

  private extractUserFromMetadata(metadata: Metadata): { id: string; name: string; email: string } {
    const userId = metadata.get('user-id')[0] as string;
    const userName = metadata.get('user-name')[0] as string;
    const userEmail = metadata.get('user-email')[0] as string;

    if (!userId || !userName || !userEmail) {
      throw new RpcException({
        code: 16, // UNAUTHENTICATED
        message: 'User information missing from metadata',
      });
    }

    return {
      id: userId,
      name: userName,
      email: userEmail,
    };
  }

  private mapCreateRequestToDto(data: CreateDealRequest): CreateDealDto {
    // Validate required fields are present and not empty strings
    const missingFields: string[] = [];
    if (!data.name) missingFields.push('name');
    if (!data.accountId) missingFields.push('accountId');
    if (!data.ownerId) missingFields.push('ownerId');

    if (missingFields.length > 0) {
      throw new RpcException({
        code: 3, // INVALID_ARGUMENT
        message: `Required fields missing or empty: ${missingFields.join(', ')} are required`,
      });
    }

    // Helper to convert empty strings to undefined for optional fields
    const safeValue = <T>(value: T | null | undefined | ''): T | undefined => {
      return (value === null || value === undefined || value === '') ? undefined : value;
    };

    // Helper to convert ISO date string to Date
    const safeDate = (value: string | null | undefined): Date | undefined => {
      if (!value || value === '') return undefined;
      try {
        return new Date(value);
      } catch {
        return undefined;
      }
    };

    return {
      name: data.name,
      accountId: data.accountId,
      ownerId: data.ownerId,
      leadId: safeValue(data.leadId),
      contactId: safeValue(data.contactId),
      amount: safeValue(data.amount),
      closingDate: safeDate(data.closingDate),
      currency: safeValue(data.currency),
      type: safeValue(data.type),
      stage: safeValue(data.stage),
      probability: safeValue(data.probability),
      leadSource: safeValue(data.leadSource),
      description: safeValue(data.description),
      boxFolderId: safeValue(data.boxFolderId),
      campaignSource: safeValue(data.campaignSource),
      quote: safeValue(data.quote),
    };
  }

  private mapUpdateRequestToDto(data: UpdateDealRequest): UpdateDealDto {
    // Helper to convert empty strings to undefined for optional fields
    const safeValue = <T>(value: T | null | undefined | ''): T | undefined => {
      return (value === null || value === undefined || value === '') ? undefined : value;
    };

    // Helper to convert ISO date string to Date
    const safeDate = (value: string | null | undefined): Date | undefined => {
      if (!value || value === '') return undefined;
      try {
        return new Date(value);
      } catch {
        return undefined;
      }
    };

    return {
      name: safeValue(data.name),
      accountId: safeValue(data.accountId),
      ownerId: safeValue(data.ownerId),
      leadId: data.leadId !== undefined ? (data.leadId === null ? null : safeValue(data.leadId)) : undefined,
      contactId: data.contactId !== undefined ? (data.contactId === null ? null : safeValue(data.contactId)) : undefined,
      amount: safeValue(data.amount),
      closingDate: safeDate(data.closingDate),
      currency: safeValue(data.currency),
      type: safeValue(data.type),
      stage: safeValue(data.stage),
      probability: safeValue(data.probability),
      leadSource: safeValue(data.leadSource),
      description: safeValue(data.description),
      boxFolderId: safeValue(data.boxFolderId),
      campaignSource: safeValue(data.campaignSource),
      quote: safeValue(data.quote),
    };
  }

  private mapUpdateFieldsToDto(fields: any): UpdateDealDto {
    // Helper to convert empty strings to undefined for optional fields
    const safeValue = <T>(value: T | null | undefined | ''): T | undefined => {
      return (value === null || value === undefined || value === '') ? undefined : value;
    };

    // Helper to convert ISO date string to Date
    const safeDate = (value: string | null | undefined): Date | undefined => {
      if (!value || value === '') return undefined;
      try {
        return new Date(value);
      } catch {
        return undefined;
      }
    };

    return {
      name: safeValue(fields.name),
      accountId: safeValue(fields.accountId),
      ownerId: safeValue(fields.ownerId),
      leadId: fields.leadId !== undefined ? (fields.leadId === null ? null : safeValue(fields.leadId)) : undefined,
      contactId: fields.contactId !== undefined ? (fields.contactId === null ? null : safeValue(fields.contactId)) : undefined,
      amount: safeValue(fields.amount),
      closingDate: safeDate(fields.closingDate),
      currency: safeValue(fields.currency),
      type: safeValue(fields.type),
      stage: safeValue(fields.stage),
      probability: safeValue(fields.probability),
      leadSource: safeValue(fields.leadSource),
      description: safeValue(fields.description),
      boxFolderId: safeValue(fields.boxFolderId),
      campaignSource: safeValue(fields.campaignSource),
      quote: safeValue(fields.quote),
    };
  }

  private mapResponseDtoToProto(dto: any): DealResponse {
    return {
      id: dto.id,
      name: dto.name,
      amount: dto.amount ?? undefined,
      closingDate: dto.closingDate ? dto.closingDate.toISOString() : undefined,
      currency: dto.currency ?? undefined,
      type: dto.type ?? undefined,
      stage: dto.stage ?? undefined,
      probability: dto.probability ?? undefined,
      leadSource: dto.leadSource ?? undefined,
      description: dto.description ?? undefined,
      boxFolderId: dto.boxFolderId ?? undefined,
      campaignSource: dto.campaignSource ?? undefined,
      quote: dto.quote ?? undefined,
      ownerId: dto.ownerId,
      accountId: dto.accountId,
      leadId: dto.leadId ?? undefined,
      contactId: dto.contactId ?? undefined,
      createdAt: dto.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: dto.updatedAt?.toISOString() || new Date().toISOString(),
      createdBy: dto.createdBy,
      modifiedBy: dto.modifiedBy,
      accountInfo: dto.Account ? {
        id: dto.Account.id,
        name: dto.Account.name,
      } : { id: '', name: '' },
      leadInfo: dto.Lead ? {
        id: dto.Lead.id,
        name: dto.Lead.name,
      } : undefined,
      contactInfo: dto.Contact ? {
        id: dto.Contact.id,
        name: dto.Contact.name,
      } : undefined,
      ownerData: dto.OwnerData ? {
        id: dto.OwnerData.id,
        firstName: dto.OwnerData.firstName,
        lastName: dto.OwnerData.lastName,
      } : undefined,
    };
  }
}
