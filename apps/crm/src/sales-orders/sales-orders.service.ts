import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorMessages } from '@app/common/errors';
import { SalesOrder, SalesOrderStatus } from './entities/sales-order.entity';
import { SalesOrderProduct } from './entities/sales-order-product.entity';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import {
  SalesOrderResponseDto,
  SalesOrderProductResponseDto,
} from './dto/sales-order-response.dto';

export interface PaginatedSalesOrdersResult {
  data: SalesOrderResponseDto[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class SalesOrdersService {
  constructor(
    @InjectRepository(SalesOrder)
    private readonly salesOrderRepository: Repository<SalesOrder>,
    @InjectRepository(SalesOrderProduct)
    private readonly salesOrderProductRepository: Repository<SalesOrderProduct>,
  ) {}

  async create(createDto: CreateSalesOrderDto): Promise<SalesOrderResponseDto> {
    const salesOrder = this.salesOrderRepository.create({
      ownerId: createDto.ownerId,
      subject: createDto.subject,
      customer_no: createDto.customerNo ?? null,
      pending: createDto.pending ?? null,
      carrier: createDto.carrier ?? null,
      sales_commission: createDto.salesCommission ?? null,
      accountId: createDto.accountId,
      contactId: createDto.contactId ?? null,
      dealId: createDto.dealId ?? null,
      rfqId: createDto.rfqId ?? null,
      currency: createDto.currency || 'EGP',
      status: createDto.status || SalesOrderStatus.CREATED,
      exchange_rate: createDto.exchangeRate ?? null,
      due_date: createDto.dueDate ? new Date(createDto.dueDate) : null,
      excise_duty: createDto.exciseDuty ?? null,
      billing_street: createDto.billingStreet ?? null,
      billing_city: createDto.billingCity ?? null,
      billing_state: createDto.billingState ?? null,
      billing_code: createDto.billingCode ?? null,
      billing_country: createDto.billingCountry ?? null,
      shipping_street: createDto.shippingStreet ?? null,
      shipping_city: createDto.shippingCity ?? null,
      shipping_state: createDto.shippingState ?? null,
      shipping_code: createDto.shippingCode ?? null,
      shipping_country: createDto.shippingCountry ?? null,
      total: createDto.total ?? null,
      subtotal: createDto.subtotal ?? null,
      discount: createDto.discount ?? null,
      adjustment: createDto.adjustment ?? null,
      grandtotal: createDto.grandtotal ?? null,
      termsandcondition: createDto.termsandcondition ?? null,
      description: createDto.description ?? null,
    });

    const savedOrder = await this.salesOrderRepository.save(salesOrder);

    if (createDto.products && createDto.products.length > 0) {
      const productEntities = createDto.products.map((p) =>
        this.salesOrderProductRepository.create({
          salesOrderId: savedOrder.id,
          productId: p.productId,
          listPrice: p.listPrice,
          quantity: p.quantity,
          amount: p.amount,
          discount: p.discount ?? null,
          tax: p.tax ?? null,
          total: p.total,
        }),
      );
      await this.salesOrderProductRepository.save(productEntities);
    }

    const fullOrder = await this.salesOrderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['account', 'contact', 'deal', 'quote', 'products'],
    });

    return this.transformToResponseDto(fullOrder!);
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedSalesOrdersResult> {
    const page =
      typeof paginationQuery.page === 'number'
        ? paginationQuery.page
        : Number(paginationQuery.page) || 1;
    const limit =
      typeof paginationQuery.limit === 'number'
        ? paginationQuery.limit
        : Number(paginationQuery.limit) || 10;

    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const skip = (validPage - 1) * validLimit;

    const [data, total] = await this.salesOrderRepository.findAndCount({
      take: validLimit,
      skip,
      relations: ['account', 'contact', 'deal', 'quote', 'products'],
      order: { createdAt: 'DESC' },
    });

    const lastPage = Math.ceil(total / validLimit);

    const transformed = data.map((order) =>
      this.transformToResponseDto(order),
    );

    return {
      data: transformed,
      total: total || 0,
      page: validPage,
      lastPage: lastPage || 0,
    };
  }

  async findOne(id: string): Promise<SalesOrderResponseDto> {
    const salesOrder = await this.salesOrderRepository.findOne({
      where: { id },
      relations: ['account', 'contact', 'deal', 'quote', 'products'],
    });

    if (!salesOrder) {
      throw new NotFoundException(ErrorMessages.notFound('SalesOrder', id));
    }

    return this.transformToResponseDto(salesOrder);
  }

  async update(
    id: string,
    updateDto: UpdateSalesOrderDto,
  ): Promise<SalesOrderResponseDto> {
    const salesOrder = await this.salesOrderRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!salesOrder) {
      throw new NotFoundException(ErrorMessages.notFound('SalesOrder', id));
    }

    Object.assign(salesOrder, {
      ownerId: updateDto.ownerId ?? salesOrder.ownerId,
      subject: updateDto.subject ?? salesOrder.subject,
      customer_no:
        updateDto.customerNo !== undefined
          ? updateDto.customerNo
          : salesOrder.customer_no,
      pending:
        updateDto.pending !== undefined ? updateDto.pending : salesOrder.pending,
      carrier:
        updateDto.carrier !== undefined ? updateDto.carrier : salesOrder.carrier,
      sales_commission:
        updateDto.salesCommission !== undefined
          ? updateDto.salesCommission
          : salesOrder.sales_commission,
      accountId: updateDto.accountId ?? salesOrder.accountId,
      contactId:
        updateDto.contactId !== undefined
          ? updateDto.contactId
          : salesOrder.contactId,
      dealId:
        updateDto.dealId !== undefined ? updateDto.dealId : salesOrder.dealId,
      rfqId:
        updateDto.rfqId !== undefined ? updateDto.rfqId : salesOrder.rfqId,
      currency: updateDto.currency ?? salesOrder.currency,
      status: updateDto.status ?? salesOrder.status,
      exchange_rate:
        updateDto.exchangeRate !== undefined
          ? updateDto.exchangeRate
          : salesOrder.exchange_rate,
      due_date:
        updateDto.dueDate !== undefined
          ? updateDto.dueDate
            ? new Date(updateDto.dueDate)
            : null
          : salesOrder.due_date,
      excise_duty:
        updateDto.exciseDuty !== undefined
          ? updateDto.exciseDuty
          : salesOrder.excise_duty,
      billing_street:
        updateDto.billingStreet !== undefined
          ? updateDto.billingStreet
          : salesOrder.billing_street,
      billing_city:
        updateDto.billingCity !== undefined
          ? updateDto.billingCity
          : salesOrder.billing_city,
      billing_state:
        updateDto.billingState !== undefined
          ? updateDto.billingState
          : salesOrder.billing_state,
      billing_code:
        updateDto.billingCode !== undefined
          ? updateDto.billingCode
          : salesOrder.billing_code,
      billing_country:
        updateDto.billingCountry !== undefined
          ? updateDto.billingCountry
          : salesOrder.billing_country,
      shipping_street:
        updateDto.shippingStreet !== undefined
          ? updateDto.shippingStreet
          : salesOrder.shipping_street,
      shipping_city:
        updateDto.shippingCity !== undefined
          ? updateDto.shippingCity
          : salesOrder.shipping_city,
      shipping_state:
        updateDto.shippingState !== undefined
          ? updateDto.shippingState
          : salesOrder.shipping_state,
      shipping_code:
        updateDto.shippingCode !== undefined
          ? updateDto.shippingCode
          : salesOrder.shipping_code,
      shipping_country:
        updateDto.shippingCountry !== undefined
          ? updateDto.shippingCountry
          : salesOrder.shipping_country,
      total:
        updateDto.total !== undefined ? updateDto.total : salesOrder.total,
      subtotal:
        updateDto.subtotal !== undefined
          ? updateDto.subtotal
          : salesOrder.subtotal,
      discount:
        updateDto.discount !== undefined
          ? updateDto.discount
          : salesOrder.discount,
      adjustment:
        updateDto.adjustment !== undefined
          ? updateDto.adjustment
          : salesOrder.adjustment,
      grandtotal:
        updateDto.grandtotal !== undefined
          ? updateDto.grandtotal
          : salesOrder.grandtotal,
      termsandcondition:
        updateDto.termsandcondition !== undefined
          ? updateDto.termsandcondition
          : salesOrder.termsandcondition,
      description:
        updateDto.description !== undefined
          ? updateDto.description
          : salesOrder.description,
    });

    await this.salesOrderRepository.save(salesOrder);

    if (updateDto.products !== undefined) {
      await this.salesOrderProductRepository.delete({ salesOrderId: id });

      if (updateDto.products.length > 0) {
        const productEntities = updateDto.products.map((p) =>
          this.salesOrderProductRepository.create({
            salesOrderId: id,
            productId: p.productId,
            listPrice: p.listPrice,
            quantity: p.quantity,
            amount: p.amount,
            discount: p.discount ?? null,
            tax: p.tax ?? null,
            total: p.total,
          }),
        );

        await this.salesOrderProductRepository.save(productEntities);
      }
    }

    const fullOrder = await this.salesOrderRepository.findOne({
      where: { id },
      relations: ['account', 'contact', 'deal', 'quote', 'products'],
    });

    return this.transformToResponseDto(fullOrder!);
  }

  async remove(id: string): Promise<void> {
    const salesOrder = await this.salesOrderRepository.findOneBy({ id });
    if (!salesOrder) {
      throw new NotFoundException(ErrorMessages.notFound('SalesOrder', id));
    }
    await this.salesOrderRepository.remove(salesOrder);
  }

  private transformToResponseDto(
    salesOrder: SalesOrder,
  ): SalesOrderResponseDto {
    const products: SalesOrderProductResponseDto[] = (salesOrder.products ||
      []
    ).map((p) => ({
      id: p.id,
      productId: p.productId,
      listPrice: Number(p.listPrice),
      quantity: Number(p.quantity),
      amount: Number(p.amount),
      discount: p.discount !== null && p.discount !== undefined ? Number(p.discount) : null,
      tax: p.tax !== null && p.tax !== undefined ? Number(p.tax) : null,
      total: Number(p.total),
    }));

    return {
      id: salesOrder.id,
      subject: salesOrder.subject,
      customerNo: salesOrder.customer_no || null,
      pending: salesOrder.pending || null,
      carrier: salesOrder.carrier || null,
      salesCommission:
        salesOrder.sales_commission !== null &&
        salesOrder.sales_commission !== undefined
          ? Number(salesOrder.sales_commission)
          : null,
      accountId: salesOrder.accountId,
      accountName: salesOrder.account ? salesOrder.account.name : '',
      contactId: salesOrder.contactId || null,
      contactName:
        salesOrder.contact &&
        (salesOrder.contact.first_name || salesOrder.contact.last_name)
          ? `${salesOrder.contact.first_name} ${salesOrder.contact.last_name}`.trim()
          : null,
      dealId: salesOrder.dealId || null,
      dealName: salesOrder.deal ? salesOrder.deal.name : null,
      rfqId: salesOrder.rfqId || null,
      rfqName: salesOrder.quote ? salesOrder.quote.rfqName : null,
      currency: salesOrder.currency,
      exchangeRate:
        salesOrder.exchange_rate !== null &&
        salesOrder.exchange_rate !== undefined
          ? Number(salesOrder.exchange_rate)
          : null,
      dueDate: salesOrder.due_date || null,
      exciseDuty:
        salesOrder.excise_duty !== null && salesOrder.excise_duty !== undefined
          ? Number(salesOrder.excise_duty)
          : null,
      status: salesOrder.status,
      billingStreet: salesOrder.billing_street || null,
      billingCity: salesOrder.billing_city || null,
      billingState: salesOrder.billing_state || null,
      billingCode: salesOrder.billing_code || null,
      billingCountry: salesOrder.billing_country || null,
      shippingStreet: salesOrder.shipping_street || null,
      shippingCity: salesOrder.shipping_city || null,
      shippingState: salesOrder.shipping_state || null,
      shippingCode: salesOrder.shipping_code || null,
      shippingCountry: salesOrder.shipping_country || null,
      total:
        salesOrder.total !== null && salesOrder.total !== undefined
          ? Number(salesOrder.total)
          : null,
      subtotal:
        salesOrder.subtotal !== null && salesOrder.subtotal !== undefined
          ? Number(salesOrder.subtotal)
          : null,
      discount:
        salesOrder.discount !== null && salesOrder.discount !== undefined
          ? Number(salesOrder.discount)
          : null,
      adjustment:
        salesOrder.adjustment !== null && salesOrder.adjustment !== undefined
          ? Number(salesOrder.adjustment)
          : null,
      grandtotal:
        salesOrder.grandtotal !== null && salesOrder.grandtotal !== undefined
          ? Number(salesOrder.grandtotal)
          : null,
      termsandcondition: salesOrder.termsandcondition || null,
      description: salesOrder.description || null,
      products,
      createdAt: salesOrder.createdAt,
      updatedAt: salesOrder.updatedAt,
    };
  }
}

