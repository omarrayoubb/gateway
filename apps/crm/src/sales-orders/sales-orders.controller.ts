import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { GrpcErrorMapper } from '../common';
import { SalesOrdersService } from './sales-orders.service';
import type {
  CreateSalesOrderRequest,
  UpdateSalesOrderRequest,
  PaginationRequest,
  FindOneSalesOrderRequest,
  DeleteSalesOrderRequest,
  SalesOrderResponse,
  PaginatedSalesOrdersResponse,
  DeleteSalesOrderResponse,
} from '@app/common/types/sales-orders';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { PaginationQueryDto } from './dto/pagination.dto';

@Controller()
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @GrpcMethod('SalesOrdersService', 'CreateSalesOrder')
  async createSalesOrder(
    data: CreateSalesOrderRequest,
    metadata: Metadata,
  ): Promise<SalesOrderResponse> {
    try {
      const createDto = this.mapCreateRequestToDto(data);
      const result = await this.salesOrdersService.create(createDto);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error('Error in CRM SalesOrdersController.createSalesOrder:', error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('SalesOrdersService', 'FindAllSalesOrders')
  async findAllSalesOrders(
    data: PaginationRequest,
  ): Promise<PaginatedSalesOrdersResponse> {
    try {
      const page =
        data.page && typeof data.page === 'number'
          ? data.page
          : Number(data.page) || 1;
      const limit =
        data.limit && typeof data.limit === 'number'
          ? data.limit
          : Number(data.limit) || 10;

      const paginationDto: PaginationQueryDto = {
        page: Math.max(1, page),
        limit: Math.max(1, Math.min(100, limit)),
      };

      const result = await this.salesOrdersService.findAll(paginationDto);

      if (!result || !result.data || !Array.isArray(result.data)) {
        console.error('Invalid result from SalesOrdersService.findAll:', result);
        return {
          data: [],
          total: result?.total || 0,
          page: result?.page || page,
          lastPage: result?.lastPage || 0,
        };
      }

      return {
        data: result.data.map((order) => this.mapResponseDtoToProto(order)),
        total: result.total || 0,
        page: result.page || page,
        lastPage: result.lastPage || 0,
      };
    } catch (error) {
      console.error('Error in SalesOrdersController.findAllSalesOrders:', error);
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('SalesOrdersService', 'FindOneSalesOrder')
  async findOneSalesOrder(
    data: FindOneSalesOrderRequest,
  ): Promise<SalesOrderResponse> {
    try {
      const result = await this.salesOrdersService.findOne(data.id);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(
        `Error in CRM SalesOrdersController.findOneSalesOrder for ID ${data.id}:`,
        error,
      );
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('SalesOrdersService', 'UpdateSalesOrder')
  async updateSalesOrder(
    data: UpdateSalesOrderRequest,
    metadata: Metadata,
  ): Promise<SalesOrderResponse> {
    try {
      const updateDto = this.mapUpdateRequestToDto(data);
      const result = await this.salesOrdersService.update(data.id, updateDto);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(
        `Error in CRM SalesOrdersController.updateSalesOrder for ID ${data.id}:`,
        error,
      );
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  @GrpcMethod('SalesOrdersService', 'DeleteSalesOrder')
  async deleteSalesOrder(
    data: DeleteSalesOrderRequest,
  ): Promise<DeleteSalesOrderResponse> {
    try {
      await this.salesOrdersService.remove(data.id);
      return {
        success: true,
        message: `Sales order with ID ${data.id} deleted successfully`,
      };
    } catch (error) {
      console.error(
        `Error in CRM SalesOrdersController.deleteSalesOrder for ID ${data.id}:`,
        error,
      );
      throw GrpcErrorMapper.fromHttpException(error);
    }
  }

  private mapCreateRequestToDto(
    data: CreateSalesOrderRequest,
  ): CreateSalesOrderDto {
    return {
      ownerId: data.ownerId,
      subject: data.subject,
      customerNo: data.customerNo,
      pending: data.pending,
      carrier: data.carrier,
      salesCommission: data.salesCommission,
      accountId: data.accountId,
      contactId: data.contactId,
      dealId: data.dealId,
      rfqId: data.rfqId,
      currency: data.currency,
      exchangeRate: data.exchangeRate,
      dueDate: data.dueDate ? (data.dueDate as any) : undefined,
      exciseDuty: data.exciseDuty,
      status: data.status as any,
      billingStreet: data.billingStreet,
      billingCity: data.billingCity,
      billingState: data.billingState,
      billingCode: data.billingCode,
      billingCountry: data.billingCountry,
      shippingStreet: data.shippingStreet,
      shippingCity: data.shippingCity,
      shippingState: data.shippingState,
      shippingCode: data.shippingCode,
      shippingCountry: data.shippingCountry,
      total: data.total,
      subtotal: data.subtotal,
      discount: data.discount,
      adjustment: data.adjustment,
      grandtotal: data.grandtotal,
      termsandcondition: data.termsandcondition,
      description: data.description,
      products: data.products?.map((p) => ({
        productId: p.productId,
        listPrice: p.listPrice,
        quantity: p.quantity,
        amount: p.amount,
        discount: p.discount,
        tax: p.tax,
        total: p.total,
      })),
    };
  }

  private mapUpdateRequestToDto(
    data: UpdateSalesOrderRequest,
  ): UpdateSalesOrderDto {
    return {
      ownerId: data.ownerId,
      subject: data.subject,
      customerNo: data.customerNo,
      pending: data.pending,
      carrier: data.carrier,
      salesCommission: data.salesCommission,
      accountId: data.accountId,
      contactId: data.contactId,
      dealId: data.dealId,
      rfqId: data.rfqId,
      currency: data.currency,
      exchangeRate: data.exchangeRate,
      dueDate: data.dueDate ? (data.dueDate as any) : undefined,
      exciseDuty: data.exciseDuty,
      status: data.status as any,
      billingStreet: data.billingStreet,
      billingCity: data.billingCity,
      billingState: data.billingState,
      billingCode: data.billingCode,
      billingCountry: data.billingCountry,
      shippingStreet: data.shippingStreet,
      shippingCity: data.shippingCity,
      shippingState: data.shippingState,
      shippingCode: data.shippingCode,
      shippingCountry: data.shippingCountry,
      total: data.total,
      subtotal: data.subtotal,
      discount: data.discount,
      adjustment: data.adjustment,
      grandtotal: data.grandtotal,
      termsandcondition: data.termsandcondition,
      description: data.description,
      products: data.products?.map((p) => ({
        productId: p.productId,
        listPrice: p.listPrice,
        quantity: p.quantity,
        amount: p.amount,
        discount: p.discount,
        tax: p.tax,
        total: p.total,
      })),
    };
  }

  private mapResponseDtoToProto(dto: any): SalesOrderResponse {
    return {
      id: dto.id,
      subject: dto.subject,
      customerNo: dto.customerNo || undefined,
      pending: dto.pending || undefined,
      carrier: dto.carrier || undefined,
      salesCommission: dto.salesCommission ?? undefined,
      accountId: dto.accountId,
      accountName: dto.accountName || '',
      contactId: dto.contactId || undefined,
      contactName: dto.contactName || undefined,
      dealId: dto.dealId || undefined,
      dealName: dto.dealName || undefined,
      rfqId: dto.rfqId || undefined,
      rfqName: dto.rfqName || undefined,
      currency: dto.currency,
      exchangeRate: dto.exchangeRate ?? undefined,
      dueDate:
        dto.dueDate instanceof Date
          ? dto.dueDate.toISOString()
          : dto.dueDate || undefined,
      exciseDuty: dto.exciseDuty ?? undefined,
      status: dto.status,
      billingStreet: dto.billingStreet || undefined,
      billingCity: dto.billingCity || undefined,
      billingState: dto.billingState || undefined,
      billingCode: dto.billingCode || undefined,
      billingCountry: dto.billingCountry || undefined,
      shippingStreet: dto.shippingStreet || undefined,
      shippingCity: dto.shippingCity || undefined,
      shippingState: dto.shippingState || undefined,
      shippingCode: dto.shippingCode || undefined,
      shippingCountry: dto.shippingCountry || undefined,
      total: dto.total ?? undefined,
      subtotal: dto.subtotal ?? undefined,
      discount: dto.discount ?? undefined,
      adjustment: dto.adjustment ?? undefined,
      grandtotal: dto.grandtotal ?? undefined,
      termsandcondition: dto.termsandcondition || undefined,
      description: dto.description || undefined,
      products: (dto.products || []).map((p: any) => ({
        id: p.id,
        productId: p.productId,
        listPrice: p.listPrice,
        quantity: p.quantity,
        amount: p.amount,
        discount: p.discount ?? undefined,
        tax: p.tax ?? undefined,
        total: p.total,
      })),
      createdAt:
        dto.createdAt instanceof Date
          ? dto.createdAt.toISOString()
          : dto.createdAt,
      updatedAt:
        dto.updatedAt instanceof Date
          ? dto.updatedAt.toISOString()
          : dto.updatedAt,
    };
  }
}

