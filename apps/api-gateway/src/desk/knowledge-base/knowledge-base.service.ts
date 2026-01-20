import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
import { BulkDeleteResponse as BulkDeleteResponseDto } from './dto/bulk-delete-response.dto';
import { BulkUpdateResponse as BulkUpdateResponseDto } from './dto/bulk-update-response.dto';

interface KnowledgeBaseGrpcService {
  createKnowledgeBase(data: CreateKnowledgeBaseRequest, metadata?: Metadata): Observable<KnowledgeBaseResponse>;
  findAllKnowledgeBases(data: PaginationRequest): Observable<PaginatedKnowledgeBasesResponse>;
  findOneKnowledgeBase(data: FindOneKnowledgeBaseRequest): Observable<KnowledgeBaseResponse>;
  updateKnowledgeBase(data: UpdateKnowledgeBaseRequest, metadata?: Metadata): Observable<KnowledgeBaseResponse>;
  deleteKnowledgeBase(data: DeleteKnowledgeBaseRequest): Observable<DeleteKnowledgeBaseResponse>;
  bulkDeleteKnowledgeBases(data: BulkDeleteRequest): Observable<BulkDeleteResponse>;
  bulkUpdateKnowledgeBases(data: BulkUpdateRequest, metadata?: Metadata): Observable<BulkUpdateResponse>;
}

export interface PaginatedKnowledgeBasesResult {
  data: KnowledgeBaseResponseDto[];
  total: number;
  page: number;
  last_page: number;
}

@Injectable()
export class KnowledgeBaseService implements OnModuleInit {
  private knowledgeBaseGrpcService: KnowledgeBaseGrpcService;

  constructor(@Inject('DESK_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.knowledgeBaseGrpcService = this.client.getService<KnowledgeBaseGrpcService>('KnowledgeBaseService');
  }

  createKnowledgeBase(createKnowledgeBaseDto: CreateKnowledgeBaseDto, currentUser: { id: string; name: string; email: string }): Observable<KnowledgeBaseResponseDto> {
    const request: CreateKnowledgeBaseRequest = this.mapCreateDtoToRequest(createKnowledgeBaseDto);
    const metadata = this.createUserMetadata(currentUser);
    return this.knowledgeBaseGrpcService.createKnowledgeBase(request, metadata).pipe(
      map(response => this.mapResponseToDto(response)),
      catchError(error => {
        console.error('Error in createKnowledgeBase gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  findAllKnowledgeBases(paginationQuery: PaginationQueryDto): Observable<PaginatedKnowledgeBasesResult> {
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;
    
    const request: PaginationRequest = {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(100, Math.floor(limit))),
    };
    return this.knowledgeBaseGrpcService.findAllKnowledgeBases(request).pipe(
      map(response => {
        if (!response) {
          throw new Error('Empty response from Desk microservice');
        }
        if (!response.data || !Array.isArray(response.data)) {
          console.error('Invalid response structure from Desk:', JSON.stringify(response, null, 2));
          return {
            data: [],
            total: response.total || 0,
            page: response.page || page,
            last_page: response.lastPage || 0,
          };
        }
        return {
          data: response.data.map(item => this.mapResponseToDto(item)),
          total: response.total || 0,
          page: response.page || page,
          last_page: response.lastPage || 0,
        };
      }),
      catchError(error => {
        console.error('Error fetching knowledge base articles from Desk microservice:', error);
        return throwError(() => error);
      })
    );
  }

  findOneKnowledgeBase(id: string): Observable<KnowledgeBaseResponseDto> {
    const request: FindOneKnowledgeBaseRequest = { id };
    return this.knowledgeBaseGrpcService.findOneKnowledgeBase(request).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  updateKnowledgeBase(id: string, updateKnowledgeBaseDto: UpdateKnowledgeBaseDto, currentUser: { id: string; name: string; email: string }): Observable<KnowledgeBaseResponseDto> {
    const request: UpdateKnowledgeBaseRequest = {
      id,
      ...this.mapUpdateDtoToRequest(updateKnowledgeBaseDto),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.knowledgeBaseGrpcService.updateKnowledgeBase(request, metadata).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  remove(id: string): Observable<void> {
    const request: DeleteKnowledgeBaseRequest = { id };
    return this.knowledgeBaseGrpcService.deleteKnowledgeBase(request).pipe(
      map(() => undefined)
    );
  }

  bulkRemove(bulkDeleteDto: BulkDeleteDto): Observable<BulkDeleteResponseDto> {
    const request: BulkDeleteRequest = {
      ids: bulkDeleteDto.ids,
    };
    return this.knowledgeBaseGrpcService.bulkDeleteKnowledgeBases(request).pipe(
      map(response => ({
        deletedCount: response.deleted_count,
        failedIds: response.failed_ids || [],
      }))
    );
  }

  bulkUpdate(bulkUpdateDto: BulkUpdateKnowledgeBaseDto, currentUser: { id: string; name: string; email: string }): Observable<BulkUpdateResponseDto> {
    const request: BulkUpdateRequest = {
      ids: bulkUpdateDto.ids,
      update_fields: this.mapUpdateDtoToRequest(bulkUpdateDto.updateFields),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.knowledgeBaseGrpcService.bulkUpdateKnowledgeBases(request, metadata).pipe(
      map(response => ({
        updatedCount: response.updated_count,
        failedItems: response.failed_items || [],
      }))
    );
  }

  private createUserMetadata(user: { id: string; name: string; email: string }): Metadata {
    // Handle undefined user
    const safeUser = user || { id: 'system', name: 'System User', email: 'system@example.com' };
    const metadata = new Metadata();
    metadata.add('user-id', safeUser.id);
    metadata.add('user-name', safeUser.name);
    metadata.add('user-email', safeUser.email);
    return metadata;
  }

  private mapCreateDtoToRequest(dto: CreateKnowledgeBaseDto): CreateKnowledgeBaseRequest {
    return {
      articleTitle: dto.articleTitle,
      category: dto.category,
      status: dto.status,
      content: dto.content,
      author: dto.author,
    };
  }

  private mapUpdateDtoToRequest(dto: UpdateKnowledgeBaseDto | Partial<UpdateKnowledgeBaseDto>): Partial<UpdateKnowledgeBaseRequest> {
    const request: Partial<UpdateKnowledgeBaseRequest> = {};
    const dtoAny = dto as any;

    if (dtoAny.articleTitle !== undefined) request.articleTitle = dtoAny.articleTitle;
    if (dtoAny.category !== undefined) request.category = dtoAny.category;
    if (dtoAny.status !== undefined) request.status = dtoAny.status;
    if (dtoAny.content !== undefined) request.content = dtoAny.content;
    if (dtoAny.author !== undefined) request.author = dtoAny.author;

    return request;
  }

  private mapResponseToDto(response: KnowledgeBaseResponse): KnowledgeBaseResponseDto {
    return {
      id: response.id,
      articleTitle: response.articleTitle,
      category: response.category,
      status: response.status,
      content: response.content,
      author: response.author,
      createdAt: new Date(response.created_at),
      updatedAt: new Date(response.updated_at),
    };
  }
}

