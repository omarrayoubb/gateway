import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { TicketsService } from './tickets.service';
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

@Controller()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @GrpcMethod('TicketService', 'CreateTicket')
  async createTicket(
    data: CreateTicketRequest,
    metadata: Metadata,
  ): Promise<TicketResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const createTicketDto = this.mapCreateRequestToDto(data);
      const result = await this.ticketsService.create(createTicketDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error('Error in Desk TicketsController.createTicket:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred',
      });
    }
  }

  @GrpcMethod('TicketService', 'FindAllTickets')
  async findAllTickets(data: PaginationRequest): Promise<PaginatedTicketsResponse> {
    try {
      const page = data.page && typeof data.page === 'number' ? data.page : Number(data.page) || 1;
      const limit = data.limit && typeof data.limit === 'number' ? data.limit : Number(data.limit) || 10;
      
      const paginationDto: PaginationQueryDto = {
        page: Math.max(1, page),
        limit: Math.max(1, Math.min(100, limit)),
      };
      const result = await this.ticketsService.findAll(paginationDto);
      
      if (!result || !result.data || !Array.isArray(result.data)) {
        console.error('Invalid result from TicketsService.findAll:', result);
        return {
          data: [],
          total: result?.total || 0,
          page: result?.page || page,
          lastPage: result?.lastPage || 0,
        };
      }
      
      return {
        data: result.data.map(ticket => this.mapResponseDtoToProto(ticket)),
        total: result.total || 0,
        page: result.page || page,
        lastPage: result.lastPage || 0,
      };
    } catch (error) {
      console.error('Error in findAllTickets:', error);
      throw new RpcException({
        code: 13,
        message: `Failed to fetch tickets: ${error.message}`,
      });
    }
  }

  @GrpcMethod('TicketService', 'FindOneTicket')
  async findOneTicket(data: FindOneTicketRequest): Promise<TicketResponse> {
    try {
      const result = await this.ticketsService.findOne(data.id);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in Desk TicketsController.findOneTicket for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during findOneTicket for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('TicketService', 'UpdateTicket')
  async updateTicket(
    data: UpdateTicketRequest,
    metadata: Metadata,
  ): Promise<TicketResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const updateTicketDto = this.mapUpdateRequestToDto(data);
      const result = await this.ticketsService.update(data.id, updateTicketDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in Desk TicketsController.updateTicket for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during updateTicket for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('TicketService', 'DeleteTicket')
  async deleteTicket(data: DeleteTicketRequest): Promise<DeleteTicketResponse> {
    try {
      await this.ticketsService.remove(data.id);
      return { success: true, message: 'Ticket deleted successfully' };
    } catch (error) {
      console.error(`Error in Desk TicketsController.deleteTicket for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during deleteTicket for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('TicketService', 'BulkDeleteTickets')
  async bulkDeleteTickets(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    try {
      const bulkDeleteDto: BulkDeleteDto = { ids: data.ids };
      const result = await this.ticketsService.bulkRemove(bulkDeleteDto);
      return {
        deleted_count: result.deletedCount,
        failed_ids: result.failedIds || [],
      };
    } catch (error) {
      console.error('Error in Desk TicketsController.bulkDeleteTickets:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkDeleteTickets',
      });
    }
  }

  @GrpcMethod('TicketService', 'BulkUpdateTickets')
  async bulkUpdateTickets(
    data: BulkUpdateRequest,
    metadata: Metadata,
  ): Promise<BulkUpdateResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const bulkUpdateDto: BulkUpdateTicketDto = {
        ids: data.ids,
        updateFields: this.mapUpdateFieldsToDto(data.update_fields),
      };
      const result = await this.ticketsService.bulkUpdate(bulkUpdateDto, currentUser);
      return {
        updated_count: result.updatedCount,
        failed_items: result.failedItems || [],
      };
    } catch (error) {
      console.error('Error in Desk TicketsController.bulkUpdateTickets:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkUpdateTickets',
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

  private mapCreateRequestToDto(data: CreateTicketRequest): CreateTicketDto {
    if (!data.email || !data.subject || !data.description || !data.vendor || !data.serialNumber) {
      throw new RpcException({
        code: 3,
        message: 'Required fields missing: email, subject, description, vendor, and serialNumber are required',
      });
    }

    return {
      contactName: data.contactName,
      accountName: data.accountName,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      description: data.description,
      status: data.status as any,
      priority: data.priority as any,
      classification: data.classification as any,
      ticketOwner: data.ticketOwner,
      productName: data.productName,
      vendor: data.vendor,
      serialNumber: data.serialNumber,
      dateTime1: data.dateTime1,
      channel: data.channel,
      language: data.language,
      category: data.category,
      subcategory: data.subcategory,
      dueDate: data.dueDate,
    };
  }

  private mapUpdateRequestToDto(data: UpdateTicketRequest): UpdateTicketDto {
    const dto: UpdateTicketDto = {};

    if (data.contactName !== undefined) dto.contactName = data.contactName;
    if (data.accountName !== undefined) dto.accountName = data.accountName;
    if (data.email !== undefined) dto.email = data.email;
    if (data.phone !== undefined) dto.phone = data.phone;
    if (data.subject !== undefined) dto.subject = data.subject;
    if (data.description !== undefined) dto.description = data.description;
    if (data.status !== undefined) dto.status = data.status as any;
    if (data.priority !== undefined) dto.priority = data.priority as any;
    if (data.classification !== undefined) dto.classification = data.classification as any;
    if (data.ticketOwner !== undefined) dto.ticketOwner = data.ticketOwner;
    if (data.productName !== undefined) dto.productName = data.productName;
    if (data.vendor !== undefined) dto.vendor = data.vendor;
    if (data.serialNumber !== undefined) dto.serialNumber = data.serialNumber;
    if (data.dateTime1 !== undefined) dto.dateTime1 = data.dateTime1;
    if (data.channel !== undefined) dto.channel = data.channel;
    if (data.language !== undefined) dto.language = data.language;
    if (data.category !== undefined) dto.category = data.category;
    if (data.subcategory !== undefined) dto.subcategory = data.subcategory;
    if (data.dueDate !== undefined) dto.dueDate = data.dueDate;

    return dto;
  }

  private mapUpdateFieldsToDto(fields: any): UpdateTicketDto {
    const dto: UpdateTicketDto = {};

    if (fields.contactName !== undefined) dto.contactName = fields.contactName;
    if (fields.accountName !== undefined) dto.accountName = fields.accountName;
    if (fields.email !== undefined) dto.email = fields.email;
    if (fields.phone !== undefined) dto.phone = fields.phone;
    if (fields.subject !== undefined) dto.subject = fields.subject;
    if (fields.description !== undefined) dto.description = fields.description;
    if (fields.status !== undefined) dto.status = fields.status as any;
    if (fields.priority !== undefined) dto.priority = fields.priority as any;
    if (fields.classification !== undefined) dto.classification = fields.classification as any;
    if (fields.ticketOwner !== undefined) dto.ticketOwner = fields.ticketOwner;
    if (fields.productName !== undefined) dto.productName = fields.productName;
    if (fields.vendor !== undefined) dto.vendor = fields.vendor;
    if (fields.serialNumber !== undefined) dto.serialNumber = fields.serialNumber;
    if (fields.dateTime1 !== undefined) dto.dateTime1 = fields.dateTime1;
    if (fields.channel !== undefined) dto.channel = fields.channel;
    if (fields.language !== undefined) dto.language = fields.language;
    if (fields.category !== undefined) dto.category = fields.category;
    if (fields.subcategory !== undefined) dto.subcategory = fields.subcategory;
    if (fields.dueDate !== undefined) dto.dueDate = fields.dueDate;

    return dto;
  }

  private mapResponseDtoToProto(dto: any): TicketResponse {
    return {
      id: dto.id,
      contactName: dto.contactName ?? undefined,
      accountName: dto.accountName ?? undefined,
      email: dto.email,
      phone: dto.phone ?? undefined,
      subject: dto.subject,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      classification: dto.classification ?? undefined,
      ticketOwner: dto.ticketOwner ?? undefined,
      productName: dto.productName ?? undefined,
      vendor: dto.vendor,
      serialNumber: dto.serialNumber,
      dateTime1: dto.dateTime1 ? new Date(dto.dateTime1).toISOString() : undefined,
      channel: dto.channel ?? undefined,
      language: dto.language ?? undefined,
      category: dto.category ?? undefined,
      subcategory: dto.subcategory ?? undefined,
      dueDate: dto.dueDate ? new Date(dto.dueDate).toISOString() : undefined,
      created_at: dto.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: dto.updatedAt?.toISOString() || new Date().toISOString(),
      comments: dto.comments?.map((comment: any) => ({
        id: comment.id,
        comment: comment.comment,
        author: comment.author,
        created_at: comment.createdAt?.toISOString() || new Date().toISOString(),
        updated_at: comment.updatedAt?.toISOString() || new Date().toISOString(),
      })) || [],
      workOrders: dto.workOrders?.map((wo: any) => ({
        id: wo.id,
        name: wo.name,
      })) || [],
      activities: dto.activities?.map((activity: any) => ({
        id: activity.id,
        action: activity.action,
        performedBy: activity.performedBy,
        created_at: activity.createdAt?.toISOString() || new Date().toISOString(),
      })) || [],
    };
  }
}
