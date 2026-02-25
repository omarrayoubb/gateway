import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Metadata } from '@grpc/grpc-js';
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
import { SalesOrderResponseDto } from './dto/sales-order-response.dto';

interface SalesOrdersGrpcService {
  createSalesOrder(
    data: CreateSalesOrderRequest,
    metadata?: Metadata,
  ): Observable<SalesOrderResponse>;
  findAllSalesOrders(
    data: PaginationRequest,
  ): Observable<PaginatedSalesOrdersResponse>;
  findOneSalesOrder(
    data: FindOneSalesOrderRequest,
  ): Observable<SalesOrderResponse>;
  updateSalesOrder(
    data: UpdateSalesOrderRequest,
    metadata?: Metadata,
  ): Observable<SalesOrderResponse>;
  deleteSalesOrder(
    data: DeleteSalesOrderRequest,
  ): Observable<DeleteSalesOrderResponse>;
}

export interface PaginatedSalesOrdersResult {
  data: SalesOrderResponseDto[];
  total: number;
  page: number;
  last_page: number;
}

@Injectable()
export class SalesOrdersService implements OnModuleInit {
  private salesOrdersGrpcService: SalesOrdersGrpcService;

  constructor(@Inject('CRM_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.salesOrdersGrpcService =
      this.client.getService<SalesOrdersGrpcService>('SalesOrdersService');

    if (!this.salesOrdersGrpcService) {
      console.error('❌ SalesOrdersService not found in gRPC client');
    }
  }

  createSalesOrder(
    dto: CreateSalesOrderDto,
    currentUser: { id: string; name: string; email: string },
  ): Observable<SalesOrderResponseDto> {
    if (!this.salesOrdersGrpcService) {
      throw new Error(
        'SalesOrders gRPC service is not initialized. Check proto file and service name.',
      );
    }

    const request: CreateSalesOrderRequest = this.mapCreateDtoToRequest(dto);
    const metadata = this.createUserMetadata(currentUser);
    return this.salesOrdersGrpcService
      .createSalesOrder(request, metadata)
      .pipe(map((response) => this.mapResponseToDto(response)));
  }

  findAllSalesOrders(
    paginationQuery: PaginationQueryDto,
  ): Observable<PaginatedSalesOrdersResult> {
    if (!this.salesOrdersGrpcService) {
      throw new Error(
        'SalesOrders gRPC service is not initialized. Check proto file and service name.',
      );
    }

    const page =
      typeof paginationQuery.page === 'number'
        ? paginationQuery.page
        : Number(paginationQuery.page) || 1;
    const limit =
      typeof paginationQuery.limit === 'number'
        ? paginationQuery.limit
        : Number(paginationQuery.limit) || 10;

    const request: PaginationRequest = {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(100, Math.floor(limit))),
    };

    return this.salesOrdersGrpcService.findAllSalesOrders(request).pipe(
      map((response) => {
        if (!response) {
          throw new Error('Empty response from CRM microservice (SalesOrders)');
        }
        if (!response.data || !Array.isArray(response.data)) {
          console.error(
            'Invalid response structure from CRM (SalesOrders):',
            JSON.stringify(response, null, 2),
          );
          return {
            data: [],
            total: response.total || 0,
            page: response.page || page,
            last_page: response.lastPage || 0,
          };
        }
        return {
          data: response.data.map((item) => this.mapResponseToDto(item)),
          total: response.total || 0,
          page: response.page || page,
          last_page: response.lastPage || 0,
        };
      }),
    );
  }

  findOneSalesOrder(id: string): Observable<SalesOrderResponseDto> {
    if (!this.salesOrdersGrpcService) {
      throw new Error(
        'SalesOrders gRPC service is not initialized. Check proto file and service name.',
      );
    }
    const request: FindOneSalesOrderRequest = { id };
    return this.salesOrdersGrpcService
      .findOneSalesOrder(request)
      .pipe(map((response) => this.mapResponseToDto(response)));
  }

  updateSalesOrder(
    id: string,
    dto: UpdateSalesOrderDto,
    currentUser: { id: string; name: string; email: string },
  ): Observable<SalesOrderResponseDto> {
    if (!this.salesOrdersGrpcService) {
      throw new Error(
        'SalesOrders gRPC service is not initialized. Check proto file and service name.',
      );
    }
    const request: UpdateSalesOrderRequest = {
      id,
      ...this.mapUpdateDtoToRequest(dto),
    };
    const metadata = this.createUserMetadata(currentUser);
    return this.salesOrdersGrpcService
      .updateSalesOrder(request, metadata)
      .pipe(map((response) => this.mapResponseToDto(response)));
  }

  deleteSalesOrder(
    id: string,
  ): Observable<{ success: boolean; message: string }> {
    if (!this.salesOrdersGrpcService) {
      throw new Error(
        'SalesOrders gRPC service is not initialized. Check proto file and service name.',
      );
    }
    const request: DeleteSalesOrderRequest = { id };
    return this.salesOrdersGrpcService.deleteSalesOrder(request).pipe(
      map((response: DeleteSalesOrderResponse) => ({
        success: response.success,
        message: response.message,
      })),
    );
  }

  private mapCreateDtoToRequest(
    dto: CreateSalesOrderDto,
  ): CreateSalesOrderRequest {
    return {
      ownerId: dto.ownerId,
      subject: dto.subject,
      customerNo: dto.customerNo,
      pending: dto.pending,
      carrier: dto.carrier,
      salesCommission: dto.salesCommission,
      accountId: dto.accountId,
      contactId: dto.contactId,
      dealId: dto.dealId,
      rfqId: dto.rfqId,
      currency: dto.currency,
      exchangeRate: dto.exchangeRate,
      dueDate: dto.dueDate ? dto.dueDate.toString() : undefined,
      exciseDuty: dto.exciseDuty,
      status: dto.status,
      billingStreet: dto.billingStreet,
      billingCity: dto.billingCity,
      billingState: dto.billingState,
      billingCode: dto.billingCode,
      billingCountry: dto.billingCountry,
      shippingStreet: dto.shippingStreet,
      shippingCity: dto.shippingCity,
      shippingState: dto.shippingState,
      shippingCode: dto.shippingCode,
      shippingCountry: dto.shippingCountry,
      total: dto.total,
      subtotal: dto.subtotal,
      discount: dto.discount,
      adjustment: dto.adjustment,
      grandtotal: dto.grandtotal,
      termsandcondition: dto.termsandcondition,
      description: dto.description,
      products: dto.products?.map((p) => ({
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

  private mapUpdateDtoToRequest(
    dto: UpdateSalesOrderDto,
  ): Partial<UpdateSalesOrderRequest> {
    return {
      ownerId: dto.ownerId,
      subject: dto.subject,
      customerNo: dto.customerNo,
      pending: dto.pending,
      carrier: dto.carrier,
      salesCommission: dto.salesCommission,
      accountId: dto.accountId,
      contactId: dto.contactId,
      dealId: dto.dealId,
      rfqId: dto.rfqId,
      currency: dto.currency,
      exchangeRate: dto.exchangeRate,
      dueDate: dto.dueDate ? dto.dueDate.toString() : undefined,
      exciseDuty: dto.exciseDuty,
      status: dto.status,
      billingStreet: dto.billingStreet,
      billingCity: dto.billingCity,
      billingState: dto.billingState,
      billingCode: dto.billingCode,
      billingCountry: dto.billingCountry,
      shippingStreet: dto.shippingStreet,
      shippingCity: dto.shippingCity,
      shippingState: dto.shippingState,
      shippingCode: dto.shippingCode,
      shippingCountry: dto.shippingCountry,
      total: dto.total,
      subtotal: dto.subtotal,
      discount: dto.discount,
      adjustment: dto.adjustment,
      grandtotal: dto.grandtotal,
      termsandcondition: dto.termsandcondition,
      description: dto.description,
      products: dto.products?.map((p) => ({
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

  private mapResponseToDto(response: SalesOrderResponse): SalesOrderResponseDto {
    return {
      id: response.id,
      subject: response.subject,
      customerNo: response.customerNo ?? null,
      pending: response.pending ?? null,
      carrier: response.carrier ?? null,
      salesCommission: response.salesCommission ?? null,
      accountId: response.accountId,
      accountName: response.accountName,
      contactId: response.contactId ?? null,
      contactName: response.contactName ?? null,
      dealId: response.dealId ?? null,
      dealName: response.dealName ?? null,
      rfqId: response.rfqId ?? null,
      rfqName: response.rfqName ?? null,
      currency: response.currency,
      exchangeRate: response.exchangeRate ?? null,
      dueDate: response.dueDate ? new Date(response.dueDate) : null,
      exciseDuty: response.exciseDuty ?? null,
      status: response.status,
      billingStreet: response.billingStreet ?? null,
      billingCity: response.billingCity ?? null,
      billingState: response.billingState ?? null,
      billingCode: response.billingCode ?? null,
      billingCountry: response.billingCountry ?? null,
      shippingStreet: response.shippingStreet ?? null,
      shippingCity: response.shippingCity ?? null,
      shippingState: response.shippingState ?? null,
      shippingCode: response.shippingCode ?? null,
      shippingCountry: response.shippingCountry ?? null,
      total: response.total ?? null,
      subtotal: response.subtotal ?? null,
      discount: response.discount ?? null,
      adjustment: response.adjustment ?? null,
      grandtotal: response.grandtotal ?? null,
      termsandcondition: response.termsandcondition ?? null,
      description: response.description ?? null,
      products: (response.products || []).map((p) => ({
        id: p.id,
        productId: p.productId,
        listPrice: p.listPrice,
        quantity: p.quantity,
        amount: p.amount,
        discount: p.discount ?? null,
        tax: p.tax ?? null,
        total: p.total,
      })),
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
    };
  }

  private createUserMetadata(user: {
    id: string;
    name: string;
    email: string;
  }): Metadata {
    const safeUser = user || {
      id: 'system',
      name: 'System User',
      email: 'system@example.com',
    };
    const metadata = new Metadata();
    metadata.set('user-id', safeUser.id);
    metadata.set('user-name', safeUser.name);
    metadata.set('user-email', safeUser.email);
    return metadata;
  }
}

