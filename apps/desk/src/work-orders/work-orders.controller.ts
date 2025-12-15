import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { WorkOrdersService } from './work-orders.service';
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

@Controller()
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @GrpcMethod('WorkOrderService', 'CreateWorkOrder')
  async createWorkOrder(
    data: CreateWorkOrderRequest,
    metadata: Metadata,
  ): Promise<WorkOrderResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const createWorkOrderDto = this.mapCreateRequestToDto(data);
      const result = await this.workOrdersService.create(createWorkOrderDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error('Error in Desk WorkOrdersController.createWorkOrder:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred',
      });
    }
  }

  @GrpcMethod('WorkOrderService', 'FindAllWorkOrders')
  async findAllWorkOrders(data: PaginationRequest): Promise<PaginatedWorkOrdersResponse> {
    try {
      const page = data.page && typeof data.page === 'number' ? data.page : Number(data.page) || 1;
      const limit = data.limit && typeof data.limit === 'number' ? data.limit : Number(data.limit) || 10;
      
      const paginationDto: PaginationQueryDto = {
        page: Math.max(1, page),
        limit: Math.max(1, Math.min(100, limit)),
      };
      const result = await this.workOrdersService.findAll(paginationDto);
      
      if (!result || !result.data || !Array.isArray(result.data)) {
        console.error('Invalid result from WorkOrdersService.findAll:', result);
        return {
          data: [],
          total: result?.total || 0,
          page: result?.page || page,
          lastPage: result?.lastPage || 0,
        };
      }
      
      return {
        data: result.data.map(workOrder => this.mapResponseDtoToProto(workOrder)),
        total: result.total || 0,
        page: result.page || page,
        lastPage: result.lastPage || 0,
      };
    } catch (error) {
      console.error('Error in findAllWorkOrders:', error);
      throw new RpcException({
        code: 13,
        message: `Failed to fetch work orders: ${error.message}`,
      });
    }
  }

  @GrpcMethod('WorkOrderService', 'FindOneWorkOrder')
  async findOneWorkOrder(data: FindOneWorkOrderRequest): Promise<WorkOrderResponse> {
    try {
      const result = await this.workOrdersService.findOne(data.id);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in Desk WorkOrdersController.findOneWorkOrder for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during findOneWorkOrder for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('WorkOrderService', 'UpdateWorkOrder')
  async updateWorkOrder(
    data: UpdateWorkOrderRequest,
    metadata: Metadata,
  ): Promise<WorkOrderResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const updateWorkOrderDto = this.mapUpdateRequestToDto(data);
      const result = await this.workOrdersService.update(data.id, updateWorkOrderDto, currentUser);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in Desk WorkOrdersController.updateWorkOrder for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during updateWorkOrder for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('WorkOrderService', 'DeleteWorkOrder')
  async deleteWorkOrder(data: DeleteWorkOrderRequest): Promise<DeleteWorkOrderResponse> {
    try {
      await this.workOrdersService.remove(data.id);
      return { success: true, message: 'Work Order deleted successfully' };
    } catch (error) {
      console.error(`Error in Desk WorkOrdersController.deleteWorkOrder for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || `An unknown error occurred during deleteWorkOrder for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('WorkOrderService', 'BulkDeleteWorkOrders')
  async bulkDeleteWorkOrders(data: BulkDeleteRequest): Promise<BulkDeleteResponse> {
    try {
      const bulkDeleteDto: BulkDeleteDto = { ids: data.ids };
      const result = await this.workOrdersService.bulkRemove(bulkDeleteDto);
      return {
        deleted_count: result.deletedCount,
        failed_ids: result.failedIds || [],
      };
    } catch (error) {
      console.error('Error in Desk WorkOrdersController.bulkDeleteWorkOrders:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkDeleteWorkOrders',
      });
    }
  }

  @GrpcMethod('WorkOrderService', 'BulkUpdateWorkOrders')
  async bulkUpdateWorkOrders(
    data: BulkUpdateRequest,
    metadata: Metadata,
  ): Promise<BulkUpdateResponse> {
    try {
      const currentUser: any = this.extractUserFromMetadata(metadata);
      const bulkUpdateDto: BulkUpdateWorkOrderDto = {
        ids: data.ids,
        updateFields: this.mapUpdateFieldsToDto(data.update_fields),
      };
      const result = await this.workOrdersService.bulkUpdate(bulkUpdateDto, currentUser);
      return {
        updated_count: result.updatedCount,
        failed_items: result.failedItems || [],
      };
    } catch (error) {
      console.error('Error in Desk WorkOrdersController.bulkUpdateWorkOrders:', error);
      throw new RpcException({
        code: error.code || 2,
        message: error.message || 'An unknown error occurred during bulkUpdateWorkOrders',
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

  private mapCreateRequestToDto(data: CreateWorkOrderRequest): CreateWorkOrderDto {
    if (!data.title || !data.ticketId) {
      throw new RpcException({
        code: 3,
        message: 'Required fields missing: title and ticketId are required',
      });
    }

    return {
      title: data.title,
      ticketId: data.ticketId,
      summary: data.summary,
      agent: data.agent,
      priority: data.priority as any,
      dueDate: data.dueDate,
      currency: data.currency,
      exchangeRate: data.exchangeRate,
      company: data.company,
      contact: data.contact,
      email: data.email,
      phone: data.phone,
      mobile: data.mobile,
      serviceAddress: data.serviceAddress ? (typeof data.serviceAddress === 'string' ? JSON.parse(data.serviceAddress) : data.serviceAddress) : undefined,
      billingAddress: data.billingAddress ? (typeof data.billingAddress === 'string' ? JSON.parse(data.billingAddress) : data.billingAddress) : undefined,
      termsAndConditions: data.termsAndConditions,
      billingStatus: data.billingStatus as any,
      installationBaseId: data.installationBaseId,
      parentWorkOrderId: data.parentWorkOrderId,
      requestId: data.requestId,
      createdBy: data.createdBy,
    };
  }

  private mapUpdateRequestToDto(data: UpdateWorkOrderRequest): UpdateWorkOrderDto {
    const dto: UpdateWorkOrderDto = {};

    if (data.title !== undefined) dto.title = data.title;
    if (data.ticketId !== undefined) dto.ticketId = data.ticketId;
    if (data.summary !== undefined) dto.summary = data.summary;
    if (data.agent !== undefined) dto.agent = data.agent;
    if (data.priority !== undefined) dto.priority = data.priority as any;
    if (data.dueDate !== undefined) dto.dueDate = data.dueDate;
    if (data.currency !== undefined) dto.currency = data.currency;
    if (data.exchangeRate !== undefined) dto.exchangeRate = data.exchangeRate;
    if (data.company !== undefined) dto.company = data.company;
    if (data.contact !== undefined) dto.contact = data.contact;
    if (data.email !== undefined) dto.email = data.email;
    if (data.phone !== undefined) dto.phone = data.phone;
    if (data.mobile !== undefined) dto.mobile = data.mobile;
    if (data.serviceAddress !== undefined) dto.serviceAddress = typeof data.serviceAddress === 'string' ? JSON.parse(data.serviceAddress) : data.serviceAddress;
    if (data.billingAddress !== undefined) dto.billingAddress = typeof data.billingAddress === 'string' ? JSON.parse(data.billingAddress) : data.billingAddress;
    if (data.termsAndConditions !== undefined) dto.termsAndConditions = data.termsAndConditions;
    if (data.billingStatus !== undefined) dto.billingStatus = data.billingStatus as any;
    if (data.installationBaseId !== undefined) dto.installationBaseId = data.installationBaseId;
    if (data.parentWorkOrderId !== undefined) dto.parentWorkOrderId = data.parentWorkOrderId;
    if (data.requestId !== undefined) dto.requestId = data.requestId;

    return dto;
  }

  private mapUpdateFieldsToDto(fields: any): UpdateWorkOrderDto {
    const dto: UpdateWorkOrderDto = {};

    if (fields.title !== undefined) dto.title = fields.title;
    if (fields.ticketId !== undefined) dto.ticketId = fields.ticketId;
    if (fields.summary !== undefined) dto.summary = fields.summary;
    if (fields.agent !== undefined) dto.agent = fields.agent;
    if (fields.priority !== undefined) dto.priority = fields.priority as any;
    if (fields.dueDate !== undefined) dto.dueDate = fields.dueDate;
    if (fields.currency !== undefined) dto.currency = fields.currency;
    if (fields.exchangeRate !== undefined) dto.exchangeRate = fields.exchangeRate;
    if (fields.company !== undefined) dto.company = fields.company;
    if (fields.contact !== undefined) dto.contact = fields.contact;
    if (fields.email !== undefined) dto.email = fields.email;
    if (fields.phone !== undefined) dto.phone = fields.phone;
    if (fields.mobile !== undefined) dto.mobile = fields.mobile;
    if (fields.serviceAddress !== undefined) dto.serviceAddress = typeof fields.serviceAddress === 'string' ? JSON.parse(fields.serviceAddress) : fields.serviceAddress;
    if (fields.billingAddress !== undefined) dto.billingAddress = typeof fields.billingAddress === 'string' ? JSON.parse(fields.billingAddress) : fields.billingAddress;
    if (fields.termsAndConditions !== undefined) dto.termsAndConditions = fields.termsAndConditions;
    if (fields.billingStatus !== undefined) dto.billingStatus = fields.billingStatus as any;
    if (fields.installationBaseId !== undefined) dto.installationBaseId = fields.installationBaseId;
    if (fields.parentWorkOrderId !== undefined) dto.parentWorkOrderId = fields.parentWorkOrderId;
    if (fields.requestId !== undefined) dto.requestId = fields.requestId;

    return dto;
  }

  private mapResponseDtoToProto(dto: any): WorkOrderResponse {
    return {
      id: dto.id,
      title: dto.title,
      summary: dto.summary ?? undefined,
      agent: dto.agent ?? undefined,
      priority: dto.priority,
      dueDate: dto.dueDate ? new Date(dto.dueDate).toISOString() : undefined,
      currency: dto.currency ?? undefined,
      exchangeRate: dto.exchangeRate ?? undefined,
      company: dto.company ?? undefined,
      contact: dto.contact ?? undefined,
      email: dto.email ?? undefined,
      phone: dto.phone ?? undefined,
      mobile: dto.mobile ?? undefined,
      serviceAddress: dto.serviceAddress ? JSON.stringify(dto.serviceAddress) : undefined,
      billingAddress: dto.billingAddress ? JSON.stringify(dto.billingAddress) : undefined,
      termsAndConditions: dto.termsAndConditions ?? undefined,
      billingStatus: dto.billingStatus,
      ticketId: dto.ticketId,
      installationBaseId: dto.installationBaseId ?? undefined,
      parentWorkOrderId: dto.parentWorkOrderId ?? undefined,
      requestId: dto.requestId ?? undefined,
      createdBy: dto.createdBy ?? undefined,
      created_at: dto.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: dto.updatedAt?.toISOString() || new Date().toISOString(),
      servicesSubtotal: dto.servicesSubtotal ?? undefined,
      partsSubtotal: dto.partsSubtotal ?? undefined,
      totalTax: dto.totalTax ?? undefined,
      totalDiscount: dto.totalDiscount ?? undefined,
      grandTotal: dto.grandTotal ?? undefined,
      workOrderServices: dto.workOrderServices?.map((wos: any) => ({
        workOrderId: wos.workOrderId,
        serviceId: wos.serviceId,
        serviceName: wos.serviceName,
        quantity: wos.quantity,
        discount: wos.discount,
        taxId: wos.taxId ?? undefined,
        taxPercentage: wos.taxPercentage ?? undefined,
        amount: wos.amount,
      })) || [],
      workOrderParts: dto.workOrderParts?.map((wop: any) => ({
        workOrderId: wop.workOrderId,
        partId: wop.partId,
        partName: wop.partName,
        quantity: wop.quantity,
        discount: wop.discount,
        taxId: wop.taxId ?? undefined,
        taxPercentage: wop.taxPercentage ?? undefined,
        amount: wop.amount,
      })) || [],
      ticket: dto.ticket ? {
        id: dto.ticket.id,
        subject: dto.ticket.subject,
      } : undefined,
      installationBase: dto.installationBase ? {
        id: dto.installationBase.id,
        name: dto.installationBase.name,
      } : undefined,
    };
  }
}
