import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrderPaginationDto } from './dto/pagination.dto';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Product } from '../products/entities/product.entity';

export interface PaginatedPurchaseOrdersResult {
  data: PurchaseOrder[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    // Check if PO number already exists
    const existingPO = await this.purchaseOrderRepository.findOne({
      where: { poNumber: createPurchaseOrderDto.poNumber },
    });
    if (existingPO) {
      throw new ConflictException(`Purchase order with number ${createPurchaseOrderDto.poNumber} already exists`);
    }

    // Validate vendor exists
    const vendor = await this.vendorRepository.findOne({
      where: { id: createPurchaseOrderDto.vendorId },
    });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${createPurchaseOrderDto.vendorId} not found`);
    }

    // Validate warehouse exists
    const warehouse = await this.warehouseRepository.findOne({
      where: { id: createPurchaseOrderDto.warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${createPurchaseOrderDto.warehouseId} not found`);
    }

    // Validate products
    for (const item of createPurchaseOrderDto.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }
    }

    const purchaseOrder: PurchaseOrder = this.purchaseOrderRepository.create({
      poNumber: createPurchaseOrderDto.poNumber,
      vendorId: createPurchaseOrderDto.vendorId,
      warehouseId: createPurchaseOrderDto.warehouseId,
      orderDate: new Date(createPurchaseOrderDto.orderDate),
      expectedDeliveryDate: createPurchaseOrderDto.expectedDeliveryDate ? new Date(createPurchaseOrderDto.expectedDeliveryDate) : null,
      subtotal: createPurchaseOrderDto.subtotal,
      tax: createPurchaseOrderDto.tax,
      totalAmount: createPurchaseOrderDto.totalAmount,
      status: createPurchaseOrderDto.status ?? PurchaseOrderStatus.DRAFT,
      notes: createPurchaseOrderDto.notes,
      items: createPurchaseOrderDto.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
    });

    const savedPO = await this.purchaseOrderRepository.save(purchaseOrder);
    // save returns the entity with generated ID
    if (Array.isArray(savedPO)) {
      return await this.findOne(savedPO[0].id);
    }
    return await this.findOne(savedPO.id);
  }

  async findAll(paginationQuery: PurchaseOrderPaginationDto): Promise<PaginatedPurchaseOrdersResult> {
    try {
      const { page = 1, limit = 10, sort, status, vendorId, warehouseId, orderDate } = paginationQuery;
      const skip = (page - 1) * limit;

    const queryBuilder = this.purchaseOrderRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.warehouse', 'warehouse')
      .leftJoinAndSelect('po.vendor', 'vendor')
      .leftJoinAndSelect('po.items', 'items')
      .leftJoinAndSelect('items.product', 'product');

    if (status) {
      queryBuilder.where('po.status = :status', { status });
    }

    if (vendorId) {
      const whereCondition = status ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('po.vendorId = :vendorId', { vendorId });
    }

    if (warehouseId) {
      const whereCondition = status || vendorId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('po.warehouseId = :warehouseId', { warehouseId });
    }

    if (orderDate) {
      const whereCondition = status || vendorId || warehouseId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('DATE(po.orderDate) = :orderDate', { orderDate });
    }

    // Handle sorting
    if (sort) {
      let sortField = sort;
      let sortOrder: 'ASC' | 'DESC' = 'ASC';
      
      // Handle prefix-based sorting (e.g., "-date" means DESC)
      if (sortField.startsWith('-')) {
        sortField = sortField.substring(1);
        sortOrder = 'DESC';
      } else if (sortField.includes(':')) {
        // Handle colon-based sorting (e.g., "date:DESC")
        const [field, order] = sortField.split(':');
        sortField = field;
        sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      }
      
      // Sanitize field name to prevent SQL injection (only allow alphanumeric and underscore)
      if (sortField && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(sortField)) {
        try {
          queryBuilder.orderBy(`po.${sortField}`, sortOrder);
        } catch (error) {
          // If field doesn't exist, default to createdAt
          queryBuilder.orderBy('po.createdAt', 'DESC');
        }
      } else {
        queryBuilder.orderBy('po.createdAt', 'DESC');
      }
    } else {
      queryBuilder.orderBy('po.createdAt', 'DESC');
    }

    const [data, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    // Collect all product IDs to load in batch (always load to ensure data is available)
    const productIds = new Set<string>();
    for (const po of data) {
      if (po.items && po.items.length > 0) {
        for (const item of po.items) {
          if (item.productId) {
            productIds.add(item.productId);
          }
        }
      }
    }

    // Load all products in batch
    const products = productIds.size > 0 
      ? await this.productRepository.findBy({ id: In(Array.from(productIds)) })
      : [];
    const productMap = new Map(products.map(p => [p.id, p]));

    // Assign products to items (always assign from map to ensure data is available)
    for (const po of data) {
      if (po.items && po.items.length > 0) {
        for (const item of po.items) {
          // Always assign product from map to ensure it's available
          if (item.productId) {
            const product = productMap.get(item.productId);
            if (product) {
              item.product = product;
            } else {
              console.warn(`Product not found in map for purchase order item ${item.id}, productId: ${item.productId}`);
            }
          }
        }
      }
    }

    // Debug: Log sample purchase order to verify items and products are loaded
    if (data.length > 0 && data[0].items && data[0].items.length > 0) {
      console.log('Sample purchase order item:', {
        itemId: data[0].items[0].id,
        productId: data[0].items[0].productId,
        hasProduct: !!data[0].items[0].product,
        productName: data[0].items[0].product?.name,
      });
    }

    const lastPage = Math.ceil(total / limit);

    return {
      data: data || [],
      total: total || 0,
      page,
      limit,
      lastPage,
    };
    } catch (error) {
      console.error('Error in PurchaseOrdersService.findAll:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['warehouse', 'vendor', 'items', 'items.product'],
    });
    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }
    return purchaseOrder;
  }

  async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    // Check if PO number is being updated and if it already exists
    if (updatePurchaseOrderDto.poNumber && updatePurchaseOrderDto.poNumber !== purchaseOrder.poNumber) {
      const existingPO = await this.purchaseOrderRepository.findOne({
        where: { poNumber: updatePurchaseOrderDto.poNumber },
      });
      if (existingPO) {
        throw new ConflictException(`Purchase order with number ${updatePurchaseOrderDto.poNumber} already exists`);
      }
    }

    // Validate vendor if being updated
    if (updatePurchaseOrderDto.vendorId && updatePurchaseOrderDto.vendorId !== purchaseOrder.vendorId) {
      const vendor = await this.vendorRepository.findOne({
        where: { id: updatePurchaseOrderDto.vendorId },
      });
      if (!vendor) {
        throw new NotFoundException(`Vendor with ID ${updatePurchaseOrderDto.vendorId} not found`);
      }
    }

    // Validate warehouse if being updated
    if (updatePurchaseOrderDto.warehouseId && updatePurchaseOrderDto.warehouseId !== purchaseOrder.warehouseId) {
      const warehouse = await this.warehouseRepository.findOne({
        where: { id: updatePurchaseOrderDto.warehouseId },
      });
      if (!warehouse) {
        throw new NotFoundException(`Warehouse with ID ${updatePurchaseOrderDto.warehouseId} not found`);
      }
    }

    // Update items if provided
    if (updatePurchaseOrderDto.items) {
      // Remove existing items
      await this.purchaseOrderItemRepository.delete({ purchaseOrderId: id });

      // Validate and create new items
      for (const item of updatePurchaseOrderDto.items) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }
      }

      // Create new items
      const newItems = updatePurchaseOrderDto.items.map(item =>
        this.purchaseOrderItemRepository.create({
          purchaseOrderId: id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })
      );
      await this.purchaseOrderItemRepository.save(newItems);
    }

    const updateData: any = { ...updatePurchaseOrderDto };
    if (updatePurchaseOrderDto.orderDate) {
      updateData.orderDate = new Date(updatePurchaseOrderDto.orderDate);
    }
    if (updatePurchaseOrderDto.expectedDeliveryDate !== undefined) {
      updateData.expectedDeliveryDate = updatePurchaseOrderDto.expectedDeliveryDate ? new Date(updatePurchaseOrderDto.expectedDeliveryDate) : null;
    }
    if (updatePurchaseOrderDto.submittedForApprovalAt) {
      updateData.submittedForApprovalAt = new Date(updatePurchaseOrderDto.submittedForApprovalAt);
    }
    if (updatePurchaseOrderDto.approvedAt) {
      updateData.approvedAt = new Date(updatePurchaseOrderDto.approvedAt);
    }
    delete updateData.items; // Remove items from update data as we handle them separately

    Object.assign(purchaseOrder, updateData);
    await this.purchaseOrderRepository.save(purchaseOrder);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const purchaseOrder = await this.findOne(id);
    await this.purchaseOrderRepository.remove(purchaseOrder);
  }
}

