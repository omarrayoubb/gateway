import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { RFQ, RFQCurrency, RFQStatus } from './entities/rfq.entity';
import { RFQProduct } from './entities/rfq-product.entity';
import { CreateRFQDto } from './dto/create-rfq.dto';
import { UpdateRFQDto } from './dto/update-rfq.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import {
  RFQResponseDto,
  RFQProductResponseDto,
} from './dto/rfq-response.dto';

interface ProductsService {
  GetProduct(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetProducts(data: { page?: number; limit?: number; search?: string; status?: string }, metadata?: Metadata): Observable<any>;
}

interface VendorsService {
  GetVendor(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetVendors(data: { page?: number; limit?: number; status?: string }, metadata?: Metadata): Observable<any>;
}

export interface PaginatedRFQsResult {
  data: RFQResponseDto[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class RFQsService implements OnModuleInit {
  private productsService: ProductsService;
  private vendorsService: VendorsService;

  constructor(
    @InjectRepository(RFQ)
    private readonly rfqRepository: Repository<RFQ>,
    @InjectRepository(RFQProduct)
    private readonly rfqProductRepository: Repository<RFQProduct>,
    @Inject('SUPPLYCHAIN_PACKAGE')
    private readonly supplychainClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.productsService = this.supplychainClient.getService<ProductsService>('ProductsService');
    this.vendorsService = this.supplychainClient.getService<VendorsService>('VendorsService');
  }

  async create(createRFQDto: CreateRFQDto): Promise<RFQResponseDto> {
    // Validate that either contactId or leadId is provided, but not both
    if (!createRFQDto.contactId && !createRFQDto.leadId) {
      throw new ConflictException('Either contactId or leadId must be provided');
    }
    if (createRFQDto.contactId && createRFQDto.leadId) {
      throw new ConflictException('Cannot provide both contactId and leadId');
    }
    
    // Check if RFQ number already exists if provided
    if (createRFQDto.rfqNumber) {
      const existingRFQ = await this.rfqRepository.findOne({
        where: { rfqNumber: createRFQDto.rfqNumber },
      });
      if (existingRFQ) {
        throw new ConflictException(`RFQ with number ${createRFQDto.rfqNumber} already exists`);
      }
    }

    // Generate RFQ number if not provided
    const rfqNumber = createRFQDto.rfqNumber || await this.generateRFQNumber();

    const rfq = this.rfqRepository.create({
      rfqName: createRFQDto.rfqName,
      rfqNumber,
      accountId: createRFQDto.accountId,
      contactId: createRFQDto.contactId || null,
      leadId: createRFQDto.leadId || null,
      vendorId: createRFQDto.vendorId || null,
      currency: createRFQDto.currency || RFQCurrency.USD,
      status: createRFQDto.status || RFQStatus.SUBMITTED,
      paymentTerms: createRFQDto.paymentTerms || null,
      additionalNotes: createRFQDto.additionalNotes || null,
    });

    const savedRFQ = await this.rfqRepository.save(rfq);

    // Create RFQ products if provided
    if (createRFQDto.rfqProducts && createRFQDto.rfqProducts.length > 0) {
      const rfqProducts = createRFQDto.rfqProducts.map((productDto) =>
        this.rfqProductRepository.create({
          rfqId: savedRFQ.id,
          productId: productDto.productId!,
          quantity: productDto.quantity,
          discount: productDto.discount || null,
        }),
      );
      await this.rfqProductRepository.save(rfqProducts);
    }

    return this.transformToResponseDto(savedRFQ);
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedRFQsResult> {
    const page = typeof paginationQuery.page === 'number' ? paginationQuery.page : Number(paginationQuery.page) || 1;
    const limit = typeof paginationQuery.limit === 'number' ? paginationQuery.limit : Number(paginationQuery.limit) || 10;

    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const skip = (validPage - 1) * validLimit;

    const [data, total] = await this.rfqRepository.findAndCount({
      take: validLimit,
      skip: skip,
      relations: ['account', 'contact', 'lead', 'rfqProducts'],
      order: {
        createdAt: 'DESC',
      },
    });

    const lastPage = Math.ceil(total / validLimit);

    // Transform all RFQs with name resolution
    const transformedData = await Promise.all(
      data.map((rfq) => this.transformToResponseDto(rfq)),
    );

    return {
      data: transformedData,
      total: total || 0,
      page: validPage,
      lastPage: lastPage || 0,
    };
  }

  async findOne(id: string): Promise<RFQResponseDto> {
    const rfq = await this.rfqRepository.findOne({
      where: { id },
      relations: ['account', 'contact', 'lead', 'rfqProducts'],
    });

    if (!rfq) {
      throw new NotFoundException(`RFQ with ID ${id} not found`);
    }

    return this.transformToResponseDto(rfq);
  }

  async update(id: string, updateRFQDto: UpdateRFQDto): Promise<RFQResponseDto> {
    const rfq = await this.rfqRepository.findOne({
      where: { id },
      relations: ['rfqProducts'],
    });

    if (!rfq) {
      throw new NotFoundException(`RFQ with ID ${id} not found`);
    }

    // Validate contact/lead if being updated
    if (updateRFQDto.contactId !== undefined || updateRFQDto.leadId !== undefined) {
      const contactId = updateRFQDto.contactId ?? rfq.contactId;
      const leadId = updateRFQDto.leadId ?? rfq.leadId;
      if (!contactId && !leadId) {
        throw new ConflictException('Either contactId or leadId must be provided');
      }
      if (contactId && leadId) {
        throw new ConflictException('Cannot provide both contactId and leadId');
      }
    }

    // Check RFQ number uniqueness if being updated
    if (updateRFQDto.rfqNumber && updateRFQDto.rfqNumber !== rfq.rfqNumber) {
      const existingRFQ = await this.rfqRepository.findOne({
        where: { rfqNumber: updateRFQDto.rfqNumber },
      });
      if (existingRFQ) {
        throw new ConflictException(`RFQ with number ${updateRFQDto.rfqNumber} already exists`);
      }
    }

    // Update RFQ fields
    Object.assign(rfq, {
      rfqName: updateRFQDto.rfqName ?? rfq.rfqName,
      rfqNumber: updateRFQDto.rfqNumber ?? rfq.rfqNumber,
      accountId: updateRFQDto.accountId ?? rfq.accountId,
      contactId: updateRFQDto.contactId !== undefined ? updateRFQDto.contactId : rfq.contactId,
      leadId: updateRFQDto.leadId !== undefined ? updateRFQDto.leadId : rfq.leadId,
      vendorId: updateRFQDto.vendorId !== undefined ? updateRFQDto.vendorId : rfq.vendorId,
      currency: updateRFQDto.currency ?? rfq.currency,
      status: updateRFQDto.status ?? rfq.status,
      paymentTerms: updateRFQDto.paymentTerms !== undefined ? updateRFQDto.paymentTerms : rfq.paymentTerms,
      additionalNotes: updateRFQDto.additionalNotes !== undefined ? updateRFQDto.additionalNotes : rfq.additionalNotes,
    });

    await this.rfqRepository.save(rfq);

    // Update RFQ products if provided
    if (updateRFQDto.rfqProducts !== undefined) {
      // Delete existing products
      await this.rfqProductRepository.delete({ rfqId: id });

      // Create new products
      if (updateRFQDto.rfqProducts.length > 0) {
        const rfqProducts = updateRFQDto.rfqProducts.map((productDto) =>
          this.rfqProductRepository.create({
            rfqId: id,
            productId: productDto.productId!,
            quantity: productDto.quantity,
            discount: productDto.discount || null,
          }),
        );
        await this.rfqProductRepository.save(rfqProducts);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const rfq = await this.rfqRepository.findOneBy({ id });
    if (!rfq) {
      throw new NotFoundException(`RFQ with ID ${id} not found`);
    }
    await this.rfqRepository.remove(rfq);
  }

  private async transformToResponseDto(rfq: RFQ): Promise<RFQResponseDto> {
    // Load relations if not already loaded
    if (!rfq.account) {
      rfq = await this.rfqRepository.findOne({
        where: { id: rfq.id },
        relations: ['account', 'contact', 'lead', 'rfqProducts'],
      }) || rfq;
    }

    // Resolve product names from Supplychain
    const productNamesMap = new Map<string, string>();
    if (rfq.rfqProducts && rfq.rfqProducts.length > 0) {
      const productIds = rfq.rfqProducts.map((p) => p.productId);
      const uniqueProductIds = [...new Set(productIds)];

      await Promise.all(
        uniqueProductIds.map(async (productId) => {
          try {
            const productResponse = await firstValueFrom(
              this.productsService.GetProduct({ id: productId }, new Metadata()),
            );
            productNamesMap.set(productId, productResponse.name || 'Unknown Product');
          } catch (error) {
            productNamesMap.set(productId, 'Unknown Product');
          }
        }),
      );
    }

    // Resolve vendor name from Supplychain
    let vendorName: string | null = null;
    if (rfq.vendorId) {
      try {
        const vendorResponse = await firstValueFrom(
          this.vendorsService.GetVendor({ id: rfq.vendorId }, new Metadata()),
        );
        vendorName = vendorResponse.name || null;
      } catch (error) {
        vendorName = null;
      }
    }

    // Transform RFQ products
    const rfqProducts: RFQProductResponseDto[] = (rfq.rfqProducts || []).map((product) => ({
      id: product.id,
      productId: product.productId,
      productName: productNamesMap.get(product.productId) || 'Unknown Product',
      quantity: Number(product.quantity),
      discount: product.discount || null,
    }));

    return {
      id: rfq.id,
      rfqName: rfq.rfqName,
      rfqNumber: rfq.rfqNumber,
      accountId: rfq.accountId,
      accountName: rfq.account?.name || 'Unknown Account',
      contactId: rfq.contactId || null,
      contactName: rfq.contact
        ? `${rfq.contact.first_name} ${rfq.contact.last_name}`.trim()
        : null,
      leadId: rfq.leadId || null,
      leadName: rfq.lead
        ? `${rfq.lead.first_name} ${rfq.lead.last_name}`.trim()
        : null,
      vendorId: rfq.vendorId || null,
      vendorName: vendorName,
      currency: rfq.currency,
      status: rfq.status,
      paymentTerms: rfq.paymentTerms || null,
      additionalNotes: rfq.additionalNotes || null,
      rfqProducts,
      createdAt: rfq.createdAt,
      updatedAt: rfq.updatedAt,
    };
  }

  private async generateRFQNumber(): Promise<string> {
    const prefix = 'RFQ';
    const year = new Date().getFullYear();
    const count = await this.rfqRepository.count({
      where: {
        rfqNumber: Like(`${prefix}-${year}-%`),
      },
    });
    const sequence = String(count + 1).padStart(4, '0');
    return `${prefix}-${year}-${sequence}`;
  }
}

