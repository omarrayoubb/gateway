import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
import { PartResponseDto } from './dto/part-response.dto';
import { BulkDeleteResponse as BulkDeleteResponseDto } from './dto/bulk-delete-response.dto';
import { BulkUpdateResponse as BulkUpdateResponseDto } from './dto/bulk-update-response.dto';

interface PartGrpcService {
  createPart(data: CreatePartRequest, metadata?: Metadata): Observable<PartResponse>;
  findAllParts(data: PaginationRequest): Observable<PaginatedPartsResponse>;
  findOnePart(data: FindOnePartRequest): Observable<PartResponse>;
  updatePart(data: UpdatePartRequest, metadata?: Metadata): Observable<PartResponse>;
  deletePart(data: DeletePartRequest): Observable<DeletePartResponse>;
  bulkDeleteParts(data: BulkDeleteRequest): Observable<BulkDeleteResponse>;
  bulkUpdateParts(data: BulkUpdateRequest, metadata?: Metadata): Observable<BulkUpdateResponse>;
}

export interface PaginatedPartsResult {
  data: PartResponseDto[];
  total: number;
  page: number;
  last_page: number;
}

@Injectable()
export class PartsService implements OnModuleInit {
  private partGrpcService: PartGrpcService;

  constructor(@Inject('DESK_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.partGrpcService = this.client.getService<PartGrpcService>('PartService');
  }

  createPart(createPartDto: CreatePartDto, currentUser: { id: string; name: string; email: string }): Observable<PartResponseDto> {
    const request: CreatePartRequest = this.mapCreateDtoToRequest(createPartDto);
    const metadata = this.createUserMetadata(currentUser);
    return this.partGrpcService.createPart(request, metadata).pipe(
      map(response => this.mapResponseToDto(response)),
      catchError(error => {
        console.error('Error in createPart gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  findAllParts(paginationQuery: PaginationQueryDto): Observable<PaginatedPartsResult> {
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;
    
    const request: PaginationRequest = {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(100, Math.floor(limit))),
    };
    return this.partGrpcService.findAllParts(request).pipe(
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
        console.error('Error fetching parts from Desk microservice:', error);
        return throwError(() => error);
      })
    );
  }

  findOnePart(id: string): Observable<PartResponseDto> {
    const request: FindOnePartRequest = { id };
    return this.partGrpcService.findOnePart(request).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  updatePart(id: string, updatePartDto: UpdatePartDto, currentUser: { id: string; name: string; email: string }): Observable<PartResponseDto> {
    const request: UpdatePartRequest = {
      id,
      ...this.mapUpdateDtoToRequest(updatePartDto),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.partGrpcService.updatePart(request, metadata).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  removePart(id: string): Observable<void> {
    const request: DeletePartRequest = { id };
    return this.partGrpcService.deletePart(request).pipe(
      map(() => undefined)
    );
  }

  bulkRemoveParts(bulkDeleteDto: BulkDeleteDto): Observable<BulkDeleteResponseDto> {
    const request: BulkDeleteRequest = {
      ids: bulkDeleteDto.ids,
    };
    return this.partGrpcService.bulkDeleteParts(request).pipe(
      map(response => ({
        deletedCount: response.deleted_count,
        failedIds: response.failed_ids || [],
      }))
    );
  }

  bulkUpdateParts(bulkUpdateDto: BulkUpdatePartDto, currentUser: { id: string; name: string; email: string }): Observable<BulkUpdateResponseDto> {
    const request: BulkUpdateRequest = {
      ids: bulkUpdateDto.ids,
      update_fields: this.mapUpdateDtoToRequest(bulkUpdateDto.updateFields),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.partGrpcService.bulkUpdateParts(request, metadata).pipe(
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

  private mapCreateDtoToRequest(dto: CreatePartDto): CreatePartRequest {
    return {
      name: dto.name,
      price: dto.price,
    };
  }

  private mapUpdateDtoToRequest(dto: UpdatePartDto | Partial<UpdatePartDto>): Partial<UpdatePartRequest> {
    const request: Partial<UpdatePartRequest> = {};

    if (dto.name !== undefined) request.name = dto.name;
    if (dto.price !== undefined) request.price = dto.price;

    return request;
  }

  private mapResponseToDto(response: PartResponse): PartResponseDto {
    return {
      id: response.id,
      name: response.name,
      price: response.price,
      createdAt: new Date(response.created_at),
      updatedAt: new Date(response.updated_at),
    };
  }
}

