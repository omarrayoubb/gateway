import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Metadata } from '@grpc/grpc-js';
import type {
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
  PaginationRequest,
  FindOneWorkOrderRequest,
  DeleteWorkOrderRequest,
  BulkDeleteRequest,
  BulkUpdateRequest,
  WorkOrderResponse,
  PaginatedWorkOrdersResponse,
  DeleteWorkOrderResponse,
  BulkDeleteResponse,
  BulkUpdateResponse,
} from '@app/common/types/work-orders';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkUpdateWorkOrderDto } from './dto/bulk-update.dto';
import { WorkOrderResponseDto } from './dto/work-order-response.dto';
import { BulkDeleteResponse as BulkDeleteResponseDto } from './dto/bulk-delete-response.dto';
import { BulkUpdateResponse as BulkUpdateResponseDto } from './dto/bulk-update-response.dto';

interface WorkOrderGrpcService {
  createWorkOrder(data: CreateWorkOrderRequest, metadata?: Metadata): Observable<WorkOrderResponse>;
  findAllWorkOrders(data: PaginationRequest): Observable<PaginatedWorkOrdersResponse>;
  findOneWorkOrder(data: FindOneWorkOrderRequest): Observable<WorkOrderResponse>;
  updateWorkOrder(data: UpdateWorkOrderRequest, metadata?: Metadata): Observable<WorkOrderResponse>;
  deleteWorkOrder(data: DeleteWorkOrderRequest): Observable<DeleteWorkOrderResponse>;
  bulkDeleteWorkOrders(data: BulkDeleteRequest): Observable<BulkDeleteResponse>;
  bulkUpdateWorkOrders(data: BulkUpdateRequest, metadata?: Metadata): Observable<BulkUpdateResponse>;
}

export interface PaginatedWorkOrdersResult {
  data: WorkOrderResponseDto[];
  total: number;
  page: number;
  last_page: number;
}

@Injectable()
export class WorkOrdersService implements OnModuleInit {
  private workOrderGrpcService: WorkOrderGrpcService;

  constructor(@Inject('DESK_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.workOrderGrpcService = this.client.getService<WorkOrderGrpcService>('WorkOrderService');
  }

  createWorkOrder(createWorkOrderDto: CreateWorkOrderDto, currentUser: { id: string; name: string; email: string }): Observable<WorkOrderResponseDto> {
    const request: CreateWorkOrderRequest = this.mapCreateDtoToRequest(createWorkOrderDto);
    const metadata = this.createUserMetadata(currentUser);
    return this.workOrderGrpcService.createWorkOrder(request, metadata).pipe(
      map(response => this.mapResponseToDto(response)),
      catchError(error => {
        console.error('Error in createWorkOrder gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  findAllWorkOrders(paginationQuery: PaginationQueryDto): Observable<PaginatedWorkOrdersResult> {
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;
    
    const request: PaginationRequest = {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(100, Math.floor(limit))),
    };
    return this.workOrderGrpcService.findAllWorkOrders(request).pipe(
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
        console.error('Error fetching work orders from Desk microservice:', error);
        return throwError(() => error);
      })
    );
  }

  findOneWorkOrder(id: string): Observable<WorkOrderResponseDto> {
    const request: FindOneWorkOrderRequest = { id };
    return this.workOrderGrpcService.findOneWorkOrder(request).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  updateWorkOrder(id: string, updateWorkOrderDto: UpdateWorkOrderDto, currentUser: { id: string; name: string; email: string }): Observable<WorkOrderResponseDto> {
    const request: UpdateWorkOrderRequest = {
      id,
      ...this.mapUpdateDtoToRequest(updateWorkOrderDto),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.workOrderGrpcService.updateWorkOrder(request, metadata).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  removeWorkOrder(id: string): Observable<void> {
    const request: DeleteWorkOrderRequest = { id };
    return this.workOrderGrpcService.deleteWorkOrder(request).pipe(
      map(() => undefined)
    );
  }

  bulkRemoveWorkOrders(bulkDeleteDto: BulkDeleteDto): Observable<BulkDeleteResponseDto> {
    const request: BulkDeleteRequest = {
      ids: bulkDeleteDto.ids,
    };
    return this.workOrderGrpcService.bulkDeleteWorkOrders(request).pipe(
      map(response => ({
        deletedCount: response.deleted_count,
        failedIds: response.failed_ids || [],
      }))
    );
  }

  bulkUpdateWorkOrders(bulkUpdateDto: BulkUpdateWorkOrderDto, currentUser: { id: string; name: string; email: string }): Observable<BulkUpdateResponseDto> {
    const request: BulkUpdateRequest = {
      ids: bulkUpdateDto.ids,
      update_fields: this.mapUpdateDtoToRequest(bulkUpdateDto.updateFields),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.workOrderGrpcService.bulkUpdateWorkOrders(request, metadata).pipe(
      map(response => ({
        updatedCount: response.updated_count,
        failedItems: response.failed_items || [],
      }))
    );
  }

  private createUserMetadata(user: { id: string; name: string; email: string }): Metadata {
    const metadata = new Metadata();
    metadata.add('user-id', user.id);
    metadata.add('user-name', user.name);
    metadata.add('user-email', user.email);
    return metadata;
  }

  private mapCreateDtoToRequest(dto: CreateWorkOrderDto): CreateWorkOrderRequest {
    return {
      title: dto.title,
      ticketId: dto.ticketId,
      summary: dto.summary,
      agent: dto.agent,
      priority: dto.priority,
      dueDate: dto.dueDate,
      currency: dto.currency,
      exchangeRate: dto.exchangeRate,
      company: dto.company,
      contact: dto.contact,
      email: dto.email,
      phone: dto.phone,
      mobile: dto.mobile,
      serviceAddress: dto.serviceAddress ? JSON.stringify(dto.serviceAddress) : undefined,
      billingAddress: dto.billingAddress ? JSON.stringify(dto.billingAddress) : undefined,
      termsAndConditions: dto.termsAndConditions,
      billingStatus: dto.billingStatus,
      installationBaseId: dto.installationBaseId,
      parentWorkOrderId: dto.parentWorkOrderId,
      requestId: dto.requestId,
      createdBy: dto.createdBy,
    };
  }

  private mapUpdateDtoToRequest(dto: UpdateWorkOrderDto | Partial<UpdateWorkOrderDto>): Partial<UpdateWorkOrderRequest> {
    const request: Partial<UpdateWorkOrderRequest> = {};
    const dtoAny = dto as any;

    if (dtoAny.title !== undefined) request.title = dtoAny.title;
    if (dtoAny.ticketId !== undefined) request.ticketId = dtoAny.ticketId;
    if (dtoAny.summary !== undefined) request.summary = dtoAny.summary;
    if (dtoAny.agent !== undefined) request.agent = dtoAny.agent;
    if (dtoAny.priority !== undefined) request.priority = dtoAny.priority;
    if (dtoAny.dueDate !== undefined) request.dueDate = dtoAny.dueDate;
    if (dtoAny.currency !== undefined) request.currency = dtoAny.currency;
    if (dtoAny.exchangeRate !== undefined) request.exchangeRate = dtoAny.exchangeRate;
    if (dtoAny.company !== undefined) request.company = dtoAny.company;
    if (dtoAny.contact !== undefined) request.contact = dtoAny.contact;
    if (dtoAny.email !== undefined) request.email = dtoAny.email;
    if (dtoAny.phone !== undefined) request.phone = dtoAny.phone;
    if (dtoAny.mobile !== undefined) request.mobile = dtoAny.mobile;
    if (dtoAny.serviceAddress !== undefined) request.serviceAddress = JSON.stringify(dtoAny.serviceAddress);
    if (dtoAny.billingAddress !== undefined) request.billingAddress = JSON.stringify(dtoAny.billingAddress);
    if (dtoAny.termsAndConditions !== undefined) request.termsAndConditions = dtoAny.termsAndConditions;
    if (dtoAny.billingStatus !== undefined) request.billingStatus = dtoAny.billingStatus;
    if (dtoAny.installationBaseId !== undefined) request.installationBaseId = dtoAny.installationBaseId;
    if (dtoAny.parentWorkOrderId !== undefined) request.parentWorkOrderId = dtoAny.parentWorkOrderId;
    if (dtoAny.requestId !== undefined) request.requestId = dtoAny.requestId;

    return request;
  }

  private mapResponseToDto(response: WorkOrderResponse): WorkOrderResponseDto {
    return {
      id: response.id,
      title: response.title,
      summary: response.summary ?? null,
      agent: response.agent ?? null,
      priority: response.priority,
      dueDate: response.dueDate ? new Date(response.dueDate) : null,
      currency: response.currency ?? null,
      exchangeRate: response.exchangeRate ?? null,
      company: response.company ?? null,
      contact: response.contact ?? null,
      email: response.email ?? null,
      phone: response.phone ?? null,
      mobile: response.mobile ?? null,
      serviceAddress: response.serviceAddress ? JSON.parse(response.serviceAddress) : null,
      billingAddress: response.billingAddress ? JSON.parse(response.billingAddress) : null,
      termsAndConditions: response.termsAndConditions ?? null,
      billingStatus: response.billingStatus,
      ticketId: response.ticketId,
      installationBaseId: response.installationBaseId ?? null,
      parentWorkOrderId: response.parentWorkOrderId ?? null,
      requestId: response.requestId ?? null,
      createdBy: response.createdBy ?? null,
      createdAt: new Date(response.created_at),
      updatedAt: new Date(response.updated_at),
      servicesSubtotal: response.servicesSubtotal ?? undefined,
      partsSubtotal: response.partsSubtotal ?? undefined,
      totalTax: response.totalTax ?? undefined,
      totalDiscount: response.totalDiscount ?? undefined,
      grandTotal: response.grandTotal ?? undefined,
      workOrderServices: response.workOrderServices?.map(wos => ({
        workOrderId: wos.workOrderId,
        serviceId: wos.serviceId,
        serviceName: wos.serviceName,
        quantity: wos.quantity,
        discount: wos.discount,
        taxId: wos.taxId ?? null,
        taxPercentage: wos.taxPercentage ?? null,
        amount: wos.amount,
      })),
      workOrderParts: response.workOrderParts?.map(wop => ({
        workOrderId: wop.workOrderId,
        partId: wop.partId,
        partName: wop.partName,
        quantity: wop.quantity,
        discount: wop.discount,
        taxId: wop.taxId ?? null,
        taxPercentage: wop.taxPercentage ?? null,
        amount: wop.amount,
      })),
      ticket: response.ticket ? {
        id: response.ticket.id,
        subject: response.ticket.subject,
      } : undefined,
      installationBase: response.installationBase ? {
        id: response.installationBase.id,
        name: response.installationBase.name,
      } : undefined,
    };
  }
}

