import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { KnowledgeBaseService } from './knowledge-base.service';
import { Metadata } from '@grpc/grpc-js';
import type {
  CreateKnowledgeBaseRequest,
  UpdateKnowledgeBaseRequest,
  PaginationRequest,
  FindOneKnowledgeBaseRequest,
  DeleteKnowledgeBaseRequest,
  BulkDeleteRequest,
  BulkUpdateRequest,
  KnowledgeBaseResponse,
  PaginatedKnowledgeBasesResponse,
  DeleteKnowledgeBaseResponse,
  BulkDeleteResponse,
  BulkUpdateResponse,
} from '@app/common/types/knowledge-base';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { UpdateKnowledgeBaseDto } from './dto/update-knowledge-base.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkUpdateKnowledgeBaseDto } from './dto/bulk-update.dto';
import { KnowledgeBaseResponseDto } from './dto/knowledge-base-response.dto';

@Controller()
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @GrpcMethod('KnowledgeBaseService', 'CreateKnowledgeBase')
  async createKnowledgeBase(
    data: CreateKnowledgeBaseRequest,
    metadata: Metadata,
  ): Promise<KnowledgeBaseResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const createKnowledgeBaseDto = this.mapCreateRequestToDto(data);
      const result = await this.knowledgeBaseService.create(createKnowledgeBaseDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error('Error in Desk KnowledgeBaseController.createKnowledgeBase:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred',
      });
    }
  }

  @GrpcMethod('KnowledgeBaseService', 'FindAllKnowledgeBases')
  async findAllKnowledgeBases(data: PaginationRequest): Promise<PaginatedKnowledgeBasesResponse> {
    try {
      const page = data.page && typeof data.page === 'number' ? data.page : Number(data.page) || 1;
      const limit = data.limit && typeof data.limit === 'number' ? data.limit : Number(data.limit) || 10;
      
      const paginationDto: PaginationQueryDto = {
        page: Math.max(1, page),
        limit: Math.max(1, Math.min(100, limit)),
      };
      const result = await this.knowledgeBaseService.findAll(paginationDto);
      
      if (!result || !result.data || !Array.isArray(result.data)) {
        console.error('Invalid result from KnowledgeBaseService.findAll:', result);
        return {
          data: [],
          total: result?.total || 0,
          page: result?.page || page,
          lastPage: result?.lastPage || 0,
        };
      }
      
      return {
        data: result.data.map(kb => this.mapResponseDtoToProto(kb)),
        total: result.total || 0,
        page: result.page || page,
        lastPage: result.lastPage || 0,
      };
    } catch (error) {
      console.error('Error in findAllKnowledgeBases:', error);
      throw new RpcException({
        code: 13,
        message: `Failed to fetch knowledge base articles: ${error.message}`,
      });
    }
  }

  @GrpcMethod('KnowledgeBaseService', 'FindOneKnowledgeBase')
  async findOneKnowledgeBase(data: FindOneKnowledgeBaseRequest): Promise<KnowledgeBaseResponse> {
    try {
      const result = await this.knowledgeBaseService.findOne(data.id);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in Desk KnowledgeBaseController.findOneKnowledgeBase for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during findOneKnowledgeBase for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('KnowledgeBaseService', 'UpdateKnowledgeBase')
  async updateKnowledgeBase(
    data: UpdateKnowledgeBaseRequest,
    metadata: Metadata,
  ): Promise<KnowledgeBaseResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const updateKnowledgeBaseDto = this.mapUpdateRequestToDto(data);
      const result = await this.knowledgeBaseService.update(data.id, updateKnowledgeBaseDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in Desk KnowledgeBaseController.updateKnowledgeBase for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during updateKnowledgeBase for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('KnowledgeBaseService', 'DeleteKnowledgeBase')
  async deleteKnowledgeBase(data: DeleteKnowledgeBaseRequest): Promise<DeleteKnowledgeBaseResponse> {
    try {
      await this.knowledgeBaseService.remove(data.id);
      return { success: true, message: 'Knowledge Base article deleted successfully' };
    } catch (error) {
      console.error(`Error in Desk KnowledgeBaseController.deleteKnowledgeBase for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during deleteKnowledgeBase for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('KnowledgeBaseService', 'BulkDeleteKnowledgeBases')
  async bulkDeleteKnowledgeBases(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    try {
      const bulkDeleteDto: BulkDeleteDto = { ids: data.ids };
      const result = await this.knowledgeBaseService.bulkRemove(bulkDeleteDto);
      return {
        deleted_count: result.deletedCount,
        failed_ids: result.failedIds || [],
      };
    } catch (error) {
      console.error('Error in Desk KnowledgeBaseController.bulkDeleteKnowledgeBases:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkDeleteKnowledgeBases',
      });
    }
  }

  @GrpcMethod('KnowledgeBaseService', 'BulkUpdateKnowledgeBases')
  async bulkUpdateKnowledgeBases(
    data: BulkUpdateRequest,
    metadata: Metadata,
  ): Promise<BulkUpdateResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const bulkUpdateDto: BulkUpdateKnowledgeBaseDto = {
        ids: data.ids,
        updateFields: this.mapUpdateFieldsToDto(data.update_fields),
      };
      const result = await this.knowledgeBaseService.bulkUpdate(bulkUpdateDto, currentUser);
      return {
        updated_count: result.updatedCount,
        failed_items: result.failedItems || [],
      };
    } catch (error) {
      console.error('Error in Desk KnowledgeBaseController.bulkUpdateKnowledgeBases:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkUpdateKnowledgeBases',
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

  private mapCreateRequestToDto(data: CreateKnowledgeBaseRequest): CreateKnowledgeBaseDto {
    if (!data.articleTitle || !data.category || !data.content || !data.author) {
      throw new RpcException({
        code: 3,
        message: 'Required fields missing: articleTitle, category, content, and author are required',
      });
    }

    return {
      articleTitle: data.articleTitle,
      category: data.category,
      status: data.status,
      content: data.content,
      author: data.author,
    };
  }

  private mapUpdateRequestToDto(data: UpdateKnowledgeBaseRequest): UpdateKnowledgeBaseDto {
    const dto: UpdateKnowledgeBaseDto = {};

    if (data.articleTitle !== undefined) dto.articleTitle = data.articleTitle;
    if (data.category !== undefined) dto.category = data.category;
    if (data.status !== undefined) dto.status = data.status;
    if (data.content !== undefined) dto.content = data.content;
    if (data.author !== undefined) dto.author = data.author;

    return dto;
  }

  private mapUpdateFieldsToDto(fields: any): UpdateKnowledgeBaseDto {
    const dto: UpdateKnowledgeBaseDto = {};

    if (fields.articleTitle !== undefined) dto.articleTitle = fields.articleTitle;
    if (fields.category !== undefined) dto.category = fields.category;
    if (fields.status !== undefined) dto.status = fields.status;
    if (fields.content !== undefined) dto.content = fields.content;
    if (fields.author !== undefined) dto.author = fields.author;

    return dto;
  }

  private mapResponseDtoToProto(dto: KnowledgeBaseResponseDto): KnowledgeBaseResponse {
    return {
      id: dto.id,
      articleTitle: dto.articleTitle,
      category: dto.category,
      status: dto.status,
      content: dto.content,
      author: dto.author,
      created_at: dto.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: dto.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
}

