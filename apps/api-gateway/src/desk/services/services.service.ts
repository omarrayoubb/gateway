import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
import { ServiceResponseDto } from './dto/service-response.dto';
import { BulkDeleteResponse as BulkDeleteResponseDto } from './dto/bulk-delete-response.dto';
import { BulkUpdateResponse as BulkUpdateResponseDto } from './dto/bulk-update-response.dto';

interface ServiceGrpcService {
  createService(data: CreateServiceRequest, metadata?: Metadata): Observable<ServiceResponse>;
  findAllServices(data: PaginationRequest): Observable<PaginatedServicesResponse>;
  findOneService(data: FindOneServiceRequest): Observable<ServiceResponse>;
  updateService(data: UpdateServiceRequest, metadata?: Metadata): Observable<ServiceResponse>;
  deleteService(data: DeleteServiceRequest): Observable<DeleteServiceResponse>;
  bulkDeleteServices(data: BulkDeleteRequest): Observable<BulkDeleteResponse>;
  bulkUpdateServices(data: BulkUpdateRequest, metadata?: Metadata): Observable<BulkUpdateResponse>;
}

export interface PaginatedServicesResult {
  data: ServiceResponseDto[];
  total: number;
  page: number;
  last_page: number;
}

@Injectable()
export class ServicesService implements OnModuleInit {
  private serviceGrpcService: ServiceGrpcService;

  constructor(@Inject('DESK_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.serviceGrpcService = this.client.getService<ServiceGrpcService>('ServiceService');
  }

  createService(createServiceDto: CreateServiceDto, currentUser: { id: string; name: string; email: string }): Observable<ServiceResponseDto> {
    const request: CreateServiceRequest = this.mapCreateDtoToRequest(createServiceDto);
    const metadata = this.createUserMetadata(currentUser);
    return this.serviceGrpcService.createService(request, metadata).pipe(
      map(response => this.mapResponseToDto(response)),
      catchError(error => {
        console.error('Error in createService gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  findAllServices(paginationQuery: PaginationQueryDto): Observable<PaginatedServicesResult> {
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;
    
    const request: PaginationRequest = {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(100, Math.floor(limit))),
    };
    return this.serviceGrpcService.findAllServices(request).pipe(
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
        console.error('Error fetching services from Desk microservice:', error);
        return throwError(() => error);
      })
    );
  }

  findOneService(id: string): Observable<ServiceResponseDto> {
    const request: FindOneServiceRequest = { id };
    return this.serviceGrpcService.findOneService(request).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  updateService(id: string, updateServiceDto: UpdateServiceDto, currentUser: { id: string; name: string; email: string }): Observable<ServiceResponseDto> {
    const request: UpdateServiceRequest = {
      id,
      ...this.mapUpdateDtoToRequest(updateServiceDto),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.serviceGrpcService.updateService(request, metadata).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  removeService(id: string): Observable<void> {
    const request: DeleteServiceRequest = { id };
    return this.serviceGrpcService.deleteService(request).pipe(
      map(() => undefined)
    );
  }

  bulkRemoveServices(bulkDeleteDto: BulkDeleteDto): Observable<BulkDeleteResponseDto> {
    const request: BulkDeleteRequest = {
      ids: bulkDeleteDto.ids,
    };
    return this.serviceGrpcService.bulkDeleteServices(request).pipe(
      map(response => ({
        deletedCount: response.deleted_count,
        failedIds: response.failed_ids || [],
      }))
    );
  }

  bulkUpdateServices(bulkUpdateDto: BulkUpdateServiceDto, currentUser: { id: string; name: string; email: string }): Observable<BulkUpdateResponseDto> {
    const request: BulkUpdateRequest = {
      ids: bulkUpdateDto.ids,
      update_fields: this.mapUpdateDtoToRequest(bulkUpdateDto.updateFields),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.serviceGrpcService.bulkUpdateServices(request, metadata).pipe(
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

  private mapCreateDtoToRequest(dto: CreateServiceDto): CreateServiceRequest {
    return {
      name: dto.name,
      netPrice: dto.netPrice,
    };
  }

  private mapUpdateDtoToRequest(dto: UpdateServiceDto | Partial<UpdateServiceDto>): Partial<UpdateServiceRequest> {
    const request: Partial<UpdateServiceRequest> = {};

    if (dto.name !== undefined) request.name = dto.name;
    if (dto.netPrice !== undefined) request.netPrice = dto.netPrice;

    return request;
  }

  private mapResponseToDto(response: ServiceResponse): ServiceResponseDto {
    return {
      id: response.id,
      name: response.name,
      netPrice: response.netPrice,
      createdAt: new Date(response.created_at),
      updatedAt: new Date(response.updated_at),
    };
  }
}

