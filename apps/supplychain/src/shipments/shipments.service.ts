import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment, ShipmentStatus } from './entities/shipment.entity';
import { ShipmentItem } from './entities/shipment-item.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { ShipmentPaginationDto } from './dto/pagination.dto';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Product } from '../products/entities/product.entity';
import { InventoryBatch } from '../inventory-batches/entities/inventory-batch.entity';

export interface PaginatedShipmentsResult {
  data: Shipment[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(ShipmentItem)
    private shipmentItemRepository: Repository<ShipmentItem>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(InventoryBatch)
    private batchRepository: Repository<InventoryBatch>,
  ) {}

  async create(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    // Check if shipment number already exists
    const existingShipment = await this.shipmentRepository.findOne({
      where: { shipmentNumber: createShipmentDto.shipmentNumber },
    });
    if (existingShipment) {
      throw new ConflictException(`Shipment with number ${createShipmentDto.shipmentNumber} already exists`);
    }

    // Validate warehouse exists
    const warehouse = await this.warehouseRepository.findOne({
      where: { id: createShipmentDto.warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${createShipmentDto.warehouseId} not found`);
    }

    // Validate to_warehouse if provided
    if (createShipmentDto.toWarehouseId) {
      const toWarehouse = await this.warehouseRepository.findOne({
        where: { id: createShipmentDto.toWarehouseId },
      });
      if (!toWarehouse) {
        throw new NotFoundException(`To warehouse with ID ${createShipmentDto.toWarehouseId} not found`);
      }
    }

    // Validate vendor if provided
    if (createShipmentDto.vendorId) {
      const vendor = await this.vendorRepository.findOne({
        where: { id: createShipmentDto.vendorId },
      });
      if (!vendor) {
        throw new NotFoundException(`Vendor with ID ${createShipmentDto.vendorId} not found`);
      }
    }

    // Validate products and batches
    for (const item of createShipmentDto.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }

      if (item.batchId) {
        const batch = await this.batchRepository.findOne({
          where: { id: item.batchId },
        });
        if (!batch) {
          throw new NotFoundException(`Batch with ID ${item.batchId} not found`);
        }
      }
    }

    // Helper function to convert empty strings to null for optional UUIDs
    const toOptionalUuid = (value: string | undefined): string | null => {
      if (!value || value === '' || value.trim() === '') return null;
      return value;
    };

    const shipment: Shipment = this.shipmentRepository.create({
      shipmentNumber: createShipmentDto.shipmentNumber,
      type: createShipmentDto.type,
      warehouseId: createShipmentDto.warehouseId,
      toWarehouseId: toOptionalUuid(createShipmentDto.toWarehouseId),
      vendorId: toOptionalUuid(createShipmentDto.vendorId),
      customerName: createShipmentDto.customerName,
      trackingNumber: createShipmentDto.trackingNumber,
      carrier: createShipmentDto.carrier,
      shipmentDate: new Date(createShipmentDto.shipmentDate),
      expectedDelivery: createShipmentDto.expectedDelivery ? new Date(createShipmentDto.expectedDelivery) : null,
      status: createShipmentDto.status ?? ShipmentStatus.PENDING,
      notes: createShipmentDto.notes,
      items: createShipmentDto.items.map(item => ({
        productId: item.productId,
        batchId: toOptionalUuid(item.batchId),
        quantity: item.quantity,
      })),
    });

    const savedShipment = await this.shipmentRepository.save(shipment);
    // save returns the entity with generated ID
    if (Array.isArray(savedShipment)) {
      return await this.findOne(savedShipment[0].id);
    }
    return await this.findOne(savedShipment.id);
  }

  async findAll(paginationQuery: ShipmentPaginationDto): Promise<PaginatedShipmentsResult> {
    const { page = 1, limit = 10, sort, status, type, warehouseId, shipmentDate } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.shipmentRepository
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.warehouse', 'warehouse')
      .leftJoinAndSelect('shipment.toWarehouse', 'toWarehouse')
      .leftJoinAndSelect('shipment.vendor', 'vendor')
      .leftJoinAndSelect('shipment.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('items.batch', 'batch');

    if (status) {
      queryBuilder.where('shipment.status = :status', { status });
    }

    if (type) {
      const whereCondition = status ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('shipment.type = :type', { type });
    }

    if (warehouseId) {
      const whereCondition = status || type ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('(shipment.warehouseId = :warehouseId OR shipment.toWarehouseId = :warehouseId)', { warehouseId });
    }

    if (shipmentDate) {
      const whereCondition = status || type || warehouseId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('DATE(shipment.shipmentDate) = :shipmentDate', { shipmentDate });
    }

    // Handle sorting - only use safe, known fields
    const safeSortFields = ['createdAt', 'updatedAt', 'shipmentDate', 'shipmentNumber', 'status', 'type'];
    
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
      
      // Map common field names
      const fieldMap: { [key: string]: string } = {
        'date': 'shipmentDate',
        'number': 'shipmentNumber',
        'created': 'createdAt',
        'updated': 'updatedAt',
      };
      
      const mappedField = fieldMap[sortField] || sortField;
      
      // Only use if it's a safe field
      if (safeSortFields.includes(mappedField)) {
        queryBuilder.orderBy(`shipment.${mappedField}`, sortOrder);
      } else {
        queryBuilder.orderBy('shipment.createdAt', 'DESC');
      }
    } else {
      queryBuilder.orderBy('shipment.createdAt', 'DESC');
    }

    const [data, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    // Collect all product and batch IDs to load in batch
    const productIds = new Set<string>();
    const batchIds = new Set<string>();
    
    for (const shipment of data) {
      if (shipment.items && shipment.items.length > 0) {
        for (const item of shipment.items) {
          if (item.productId && !item.product) {
            productIds.add(item.productId);
          }
          if (item.batchId && !item.batch) {
            batchIds.add(item.batchId);
          }
        }
      }
    }

    // Load all products and batches in batch
    const products = productIds.size > 0 
      ? await this.productRepository.findBy({ id: Array.from(productIds) as any })
      : [];
    const batches = batchIds.size > 0
      ? await this.batchRepository.findBy({ id: Array.from(batchIds) as any })
      : [];

    // Create maps for quick lookup
    const productMap = new Map(products.map(p => [p.id, p]));
    const batchMap = new Map(batches.map(b => [b.id, b]));

    // Assign products and batches to items (always assign from map to ensure data is available)
    for (const shipment of data) {
      if (shipment.items && shipment.items.length > 0) {
        for (const item of shipment.items) {
          // Always assign product from map to ensure it's available
          if (item.productId) {
            const product = productMap.get(item.productId);
            if (product) {
              item.product = product;
            } else {
              console.warn(`Product not found in map for item ${item.id}, productId: ${item.productId}`);
            }
          }
          // Always assign batch from map to ensure it's available
          if (item.batchId) {
            const batch = batchMap.get(item.batchId);
            if (batch) {
              item.batch = batch;
            }
          }
        }
      }
    }

    // Debug: Log sample shipment to verify products are loaded
    if (data.length > 0 && data[0].items && data[0].items.length > 0) {
      console.log('Sample shipment item:', {
        itemId: data[0].items[0].id,
        productId: data[0].items[0].productId,
        hasProduct: !!data[0].items[0].product,
        productName: data[0].items[0].product?.name,
      });
    }

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
    };
  }

  async findOne(id: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: ['warehouse', 'toWarehouse', 'vendor', 'items', 'items.product', 'items.batch'],
    });
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }
    return shipment;
  }

  async update(id: string, updateShipmentDto: UpdateShipmentDto): Promise<Shipment> {
    const shipment = await this.findOne(id);

    // Helper function to convert empty strings to null for optional UUIDs
    const toOptionalUuid = (value: string | undefined): string | null => {
      if (!value || value === '' || value.trim() === '') return null;
      return value;
    };

    // Check if shipment number is being updated and if it already exists
    if (updateShipmentDto.shipmentNumber && updateShipmentDto.shipmentNumber !== shipment.shipmentNumber) {
      const existingShipment = await this.shipmentRepository.findOne({
        where: { shipmentNumber: updateShipmentDto.shipmentNumber },
      });
      if (existingShipment) {
        throw new ConflictException(`Shipment with number ${updateShipmentDto.shipmentNumber} already exists`);
      }
    }

    // Validate warehouse if being updated
    if (updateShipmentDto.warehouseId && updateShipmentDto.warehouseId !== shipment.warehouseId) {
      const warehouse = await this.warehouseRepository.findOne({
        where: { id: updateShipmentDto.warehouseId },
      });
      if (!warehouse) {
        throw new NotFoundException(`Warehouse with ID ${updateShipmentDto.warehouseId} not found`);
      }
    }

    // Validate to_warehouse if being updated
    if (updateShipmentDto.toWarehouseId !== undefined) {
      const toWarehouseId = toOptionalUuid(updateShipmentDto.toWarehouseId);
      if (toWarehouseId) {
        const toWarehouse = await this.warehouseRepository.findOne({
          where: { id: toWarehouseId },
        });
        if (!toWarehouse) {
          throw new NotFoundException(`To warehouse with ID ${toWarehouseId} not found`);
        }
      }
    }

    // Validate vendor if being updated
    if (updateShipmentDto.vendorId !== undefined) {
      const vendorId = toOptionalUuid(updateShipmentDto.vendorId);
      if (vendorId) {
        const vendor = await this.vendorRepository.findOne({
          where: { id: vendorId },
        });
        if (!vendor) {
          throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
        }
      }
    }

    // Update items if provided
    if (updateShipmentDto.items) {
      // Remove existing items
      await this.shipmentItemRepository.delete({ shipmentId: id });

      // Validate and create new items
      for (const item of updateShipmentDto.items) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        if (item.batchId) {
          const batch = await this.batchRepository.findOne({
            where: { id: item.batchId },
          });
          if (!batch) {
            throw new NotFoundException(`Batch with ID ${item.batchId} not found`);
          }
        }
      }

      // Create new items
      const newItems = updateShipmentDto.items.map(item =>
        this.shipmentItemRepository.create({
          shipmentId: id,
          productId: item.productId,
          batchId: toOptionalUuid(item.batchId),
          quantity: item.quantity,
        })
      );
      await this.shipmentItemRepository.save(newItems);
    }

    const updateData: any = { ...updateShipmentDto };
    if (updateShipmentDto.shipmentDate) {
      updateData.shipmentDate = new Date(updateShipmentDto.shipmentDate);
    }
    if (updateShipmentDto.expectedDelivery !== undefined) {
      updateData.expectedDelivery = updateShipmentDto.expectedDelivery ? new Date(updateShipmentDto.expectedDelivery) : null;
    }
    // Convert optional UUIDs to null if they're empty strings
    if (updateShipmentDto.toWarehouseId !== undefined) {
      updateData.toWarehouseId = toOptionalUuid(updateShipmentDto.toWarehouseId);
    }
    if (updateShipmentDto.vendorId !== undefined) {
      updateData.vendorId = toOptionalUuid(updateShipmentDto.vendorId);
    }
    delete updateData.items; // Remove items from update data as we handle them separately

    Object.assign(shipment, updateData);
    await this.shipmentRepository.save(shipment);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const shipment = await this.findOne(id);
    await this.shipmentRepository.remove(shipment);
  }
}

