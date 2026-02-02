import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Metadata } from '@grpc/grpc-js';
import type {
  CreateRFQRequest,
  UpdateRFQRequest,
  PaginationRequest,
  FindOneRFQRequest,
  DeleteRFQRequest,
  RFQResponse,
  PaginatedRfqsResponse,
  DeleteRFQResponse,
} from '@app/common/types/rfqs';
import { CreateRFQDto } from './dto/create-rfq.dto';
import { UpdateRFQDto } from './dto/update-rfq.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { RFQResponseDto } from './dto/rfq-response.dto';

interface RFQGrpcService {
  createRfq(data: CreateRFQRequest, metadata?: Metadata): Observable<RFQResponse>;
  findAllRfqs(data: PaginationRequest): Observable<PaginatedRfqsResponse>;
  findOneRfq(data: FindOneRFQRequest): Observable<RFQResponse>;
  updateRfq(data: UpdateRFQRequest, metadata?: Metadata): Observable<RFQResponse>;
  deleteRfq(data: DeleteRFQRequest): Observable<DeleteRFQResponse>;
}

export interface PaginatedRFQsResult {
  data: RFQResponseDto[];
  total: number;
  page: number;
  last_page: number;
}

@Injectable()
export class RFQsService implements OnModuleInit {
  private rfqGrpcService: RFQGrpcService;

  constructor(@Inject('CRM_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.rfqGrpcService = this.client.getService<RFQGrpcService>('RFQService');
    
    // Debug: Verify service initialization
    if (!this.rfqGrpcService) {
      console.error('❌ RFQService not found in gRPC client');
    } else if (typeof this.rfqGrpcService.createRfq !== 'function') {
      console.error('❌ RFQService found but createRfq method missing');
      console.error('Available methods:', Object.keys(this.rfqGrpcService));
    } else {
      console.log('✅ RFQService initialized successfully');
    }
  }

  createRFQ(createRFQDto: CreateRFQDto, currentUser: { id: string; name: string; email: string }): Observable<RFQResponseDto> {
    if (!this.rfqGrpcService) {
      throw new Error('RFQ gRPC service is not initialized. Check proto file and service name.');
    }
    
    if (typeof this.rfqGrpcService.createRfq !== 'function') {
      console.error('RFQService methods:', Object.keys(this.rfqGrpcService));
      throw new Error(`createRfq method not found on RFQService. Available methods: ${Object.keys(this.rfqGrpcService).join(', ')}`);
    }
    
    const request: CreateRFQRequest = this.mapCreateDtoToRequest(createRFQDto);
    const metadata = this.createUserMetadata(currentUser);
    return this.rfqGrpcService.createRfq(request, metadata).pipe(
      map(response => this.mapResponseToDto(response)),
    );
  }

  findAllRfqs(paginationQuery: PaginationQueryDto): Observable<PaginatedRFQsResult> {
    if (!this.rfqGrpcService) {
      throw new Error('RFQ gRPC service is not initialized. Check proto file and service name.');
    }
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;

    const request: PaginationRequest = {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(100, Math.floor(limit))),
    };
    return this.rfqGrpcService.findAllRfqs(request).pipe(
      map(response => {
        if (!response) {
          throw new Error('Empty response from CRM microservice');
        }
        if (!response.data || !Array.isArray(response.data)) {
          console.error('Invalid response structure from CRM:', JSON.stringify(response, null, 2));
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
    );
  }

  findOneRFQ(id: string): Observable<RFQResponseDto> {
    if (!this.rfqGrpcService) {
      throw new Error('RFQ gRPC service is not initialized. Check proto file and service name.');
    }
    const request: FindOneRFQRequest = { id };
    return this.rfqGrpcService.findOneRfq(request).pipe(
      map(response => this.mapResponseToDto(response)),
    );
  }

  updateRFQ(id: string, updateRFQDto: UpdateRFQDto, currentUser: { id: string; name: string; email: string }): Observable<RFQResponseDto> {
    if (!this.rfqGrpcService) {
      throw new Error('RFQ gRPC service is not initialized. Check proto file and service name.');
    }
    const request: UpdateRFQRequest = {
      id,
      ...this.mapUpdateDtoToRequest(updateRFQDto),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.rfqGrpcService.updateRfq(request, metadata).pipe(
      map(response => this.mapResponseToDto(response)),
    );
  }

  deleteRFQ(id: string): Observable<{ success: boolean; message: string }> {
    if (!this.rfqGrpcService) {
      throw new Error('RFQ gRPC service is not initialized. Check proto file and service name.');
    }
    const request: DeleteRFQRequest = { id };
    return this.rfqGrpcService.deleteRfq(request).pipe(
      map((response: DeleteRFQResponse) => ({
        success: response.success,
        message: response.message,
      })),
    );
  }

  private mapCreateDtoToRequest(dto: CreateRFQDto): CreateRFQRequest {
    return {
      rfqName: dto.rfqName,
      rfqNumber: dto.rfqNumber,
      accountId: dto.accountId,
      contactId: dto.contactId,
      leadId: dto.leadId,
      vendorId: dto.vendorId,
      currency: dto.currency,
      status: dto.status,
      paymentTerms: dto.paymentTerms,
      additionalNotes: dto.additionalNotes,
      rfqProducts: dto.rfqProducts?.map(p => ({
        productId: p.productId,
        quantity: p.quantity,
        discount: p.discount,
      })),
    };
  }

  private mapUpdateDtoToRequest(dto: UpdateRFQDto): Partial<UpdateRFQRequest> {
    return {
      rfqName: dto.rfqName,
      rfqNumber: dto.rfqNumber,
      accountId: dto.accountId,
      contactId: dto.contactId,
      leadId: dto.leadId,
      vendorId: dto.vendorId,
      currency: dto.currency,
      status: dto.status,
      paymentTerms: dto.paymentTerms,
      additionalNotes: dto.additionalNotes,
      rfqProducts: dto.rfqProducts?.map(p => ({
        productId: p.productId,
        quantity: p.quantity,
        discount: p.discount,
      })),
    };
  }

  private mapResponseToDto(response: RFQResponse): RFQResponseDto {
    return {
      id: response.id,
      rfqName: response.rfqName,
      rfqNumber: response.rfqNumber,
      accountId: response.accountId,
      accountName: response.accountName,
      contactId: response.contactId,
      contactName: response.contactName,
      leadId: response.leadId,
      leadName: response.leadName,
      vendorId: response.vendorId,
      vendorName: response.vendorName,
      currency: response.currency,
      status: response.status,
      paymentTerms: response.paymentTerms,
      additionalNotes: response.additionalNotes,
      rfqProducts: (response.rfqProducts || []).map(p => ({
        id: p.id,
        productId: p.productId,
        productName: p.productName,
        quantity: p.quantity,
        discount: p.discount,
      })),
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
    };
  }

  private createUserMetadata(user: { id: string; name: string; email: string }): Metadata {
    // Handle undefined user
    const safeUser = user || { id: 'system', name: 'System User', email: 'system@example.com' };
    const metadata = new Metadata();
    metadata.set('user-id', safeUser.id);
    metadata.set('user-name', safeUser.name);
    metadata.set('user-email', safeUser.email);
    return metadata;
  }
}
