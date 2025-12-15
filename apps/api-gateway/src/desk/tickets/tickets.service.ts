import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Metadata } from '@grpc/grpc-js';
import type {
  CreateTicketRequest,
  UpdateTicketRequest,
  PaginationRequest,
  FindOneTicketRequest,
  DeleteTicketRequest,
  BulkDeleteRequest,
  BulkUpdateRequest,
  TicketResponse,
  PaginatedTicketsResponse,
  DeleteTicketResponse,
  BulkDeleteResponse,
  BulkUpdateResponse,
} from '@app/common/types/tickets';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkUpdateTicketDto } from './dto/bulk-update.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { BulkDeleteResponse as BulkDeleteResponseDto } from './dto/bulk-delete-response.dto';
import { BulkUpdateResponse as BulkUpdateResponseDto } from './dto/bulk-update-response.dto';

interface TicketGrpcService {
  createTicket(data: CreateTicketRequest, metadata?: Metadata): Observable<TicketResponse>;
  findAllTickets(data: PaginationRequest): Observable<PaginatedTicketsResponse>;
  findOneTicket(data: FindOneTicketRequest): Observable<TicketResponse>;
  updateTicket(data: UpdateTicketRequest, metadata?: Metadata): Observable<TicketResponse>;
  deleteTicket(data: DeleteTicketRequest): Observable<DeleteTicketResponse>;
  bulkDeleteTickets(data: BulkDeleteRequest): Observable<BulkDeleteResponse>;
  bulkUpdateTickets(data: BulkUpdateRequest, metadata?: Metadata): Observable<BulkUpdateResponse>;
}

export interface PaginatedTicketsResult {
  data: TicketResponseDto[];
  total: number;
  page: number;
  last_page: number;
}

@Injectable()
export class TicketsService implements OnModuleInit {
  private ticketGrpcService: TicketGrpcService;

  constructor(@Inject('DESK_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.ticketGrpcService = this.client.getService<TicketGrpcService>('TicketService');
  }

  createTicket(createTicketDto: CreateTicketDto, currentUser: { id: string; name: string; email: string }): Observable<TicketResponseDto> {
    const request: CreateTicketRequest = this.mapCreateDtoToRequest(createTicketDto);
    const metadata = this.createUserMetadata(currentUser);
    return this.ticketGrpcService.createTicket(request, metadata).pipe(
      map(response => this.mapResponseToDto(response)),
      catchError(error => {
        console.error('Error in createTicket gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  findAllTickets(paginationQuery: PaginationQueryDto): Observable<PaginatedTicketsResult> {
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;
    
    const request: PaginationRequest = {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(100, Math.floor(limit))),
    };
    return this.ticketGrpcService.findAllTickets(request).pipe(
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
        console.error('Error fetching tickets from Desk microservice:', error);
        return throwError(() => error);
      })
    );
  }

  findOneTicket(id: string): Observable<TicketResponseDto> {
    const request: FindOneTicketRequest = { id };
    return this.ticketGrpcService.findOneTicket(request).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  updateTicket(id: string, updateTicketDto: UpdateTicketDto, currentUser: { id: string; name: string; email: string }): Observable<TicketResponseDto> {
    const request: UpdateTicketRequest = {
      id,
      ...this.mapUpdateDtoToRequest(updateTicketDto),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.ticketGrpcService.updateTicket(request, metadata).pipe(
      map(response => this.mapResponseToDto(response))
    );
  }

  removeTicket(id: string): Observable<void> {
    const request: DeleteTicketRequest = { id };
    return this.ticketGrpcService.deleteTicket(request).pipe(
      map(() => undefined)
    );
  }

  bulkRemoveTickets(bulkDeleteDto: BulkDeleteDto): Observable<BulkDeleteResponseDto> {
    const request: BulkDeleteRequest = {
      ids: bulkDeleteDto.ids,
    };
    return this.ticketGrpcService.bulkDeleteTickets(request).pipe(
      map(response => ({
        deletedCount: response.deleted_count,
        failedIds: response.failed_ids || [],
      }))
    );
  }

  bulkUpdateTickets(bulkUpdateDto: BulkUpdateTicketDto, currentUser: { id: string; name: string; email: string }): Observable<BulkUpdateResponseDto> {
    const request: BulkUpdateRequest = {
      ids: bulkUpdateDto.ids,
      update_fields: this.mapUpdateDtoToRequest(bulkUpdateDto.updateFields),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.ticketGrpcService.bulkUpdateTickets(request, metadata).pipe(
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

  private mapCreateDtoToRequest(dto: CreateTicketDto): CreateTicketRequest {
    return {
      contactName: dto.contactName,
      accountName: dto.accountName,
      email: dto.email,
      phone: dto.phone,
      subject: dto.subject,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      classification: dto.classification,
      ticketOwner: dto.ticketOwner,
      productName: dto.productName,
      vendor: dto.vendor,
      serialNumber: dto.serialNumber,
      dateTime1: dto.dateTime1,
      channel: dto.channel,
      language: dto.language,
      category: dto.category,
      subcategory: dto.subcategory,
      dueDate: dto.dueDate,
    };
  }

  private mapUpdateDtoToRequest(dto: UpdateTicketDto | Partial<UpdateTicketDto>): Partial<UpdateTicketRequest> {
    const request: Partial<UpdateTicketRequest> = {};

    if (dto.contactName !== undefined) request.contactName = dto.contactName;
    if (dto.accountName !== undefined) request.accountName = dto.accountName;
    if (dto.email !== undefined) request.email = dto.email;
    if (dto.phone !== undefined) request.phone = dto.phone;
    if (dto.subject !== undefined) request.subject = dto.subject;
    if (dto.description !== undefined) request.description = dto.description;
    if (dto.status !== undefined) request.status = dto.status;
    if (dto.priority !== undefined) request.priority = dto.priority;
    if (dto.classification !== undefined) request.classification = dto.classification;
    if (dto.ticketOwner !== undefined) request.ticketOwner = dto.ticketOwner;
    if (dto.productName !== undefined) request.productName = dto.productName;
    if (dto.vendor !== undefined) request.vendor = dto.vendor;
    if (dto.serialNumber !== undefined) request.serialNumber = dto.serialNumber;
    if (dto.dateTime1 !== undefined) request.dateTime1 = dto.dateTime1;
    if (dto.channel !== undefined) request.channel = dto.channel;
    if (dto.language !== undefined) request.language = dto.language;
    if (dto.category !== undefined) request.category = dto.category;
    if (dto.subcategory !== undefined) request.subcategory = dto.subcategory;
    if (dto.dueDate !== undefined) request.dueDate = dto.dueDate;

    return request;
  }

  private mapResponseToDto(response: TicketResponse): TicketResponseDto {
    return {
      id: response.id,
      contactName: response.contactName ?? null,
      accountName: response.accountName ?? null,
      email: response.email,
      phone: response.phone ?? null,
      subject: response.subject,
      description: response.description,
      status: response.status,
      priority: response.priority,
      classification: response.classification ?? null,
      ticketOwner: response.ticketOwner ?? null,
      productName: response.productName ?? null,
      vendor: response.vendor,
      serialNumber: response.serialNumber,
      dateTime1: response.dateTime1 ? new Date(response.dateTime1) : null,
      channel: response.channel ?? null,
      language: response.language ?? null,
      category: response.category ?? null,
      subcategory: response.subcategory ?? null,
      dueDate: response.dueDate ? new Date(response.dueDate) : null,
      createdAt: new Date(response.created_at),
      updatedAt: new Date(response.updated_at),
      comments: response.comments?.map(comment => ({
        id: comment.id,
        comment: comment.comment,
        author: comment.author,
        createdAt: new Date(comment.created_at),
        updatedAt: new Date(comment.updated_at),
      })),
      workOrders: response.workOrders?.map(wo => ({
        id: wo.id,
        name: wo.name,
      })),
      activities: response.activities?.map(activity => ({
        id: activity.id,
        action: activity.action,
        performedBy: activity.performedBy,
        createdAt: new Date(activity.created_at),
      })),
    };
  }
}

