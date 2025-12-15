import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryBatch, BatchStatus } from './entities/inventory-batch.entity';
import { Product } from '../products/entities/product.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { CreateInventoryBatchDto } from './dto/create-inventory-batch.dto';
import { UpdateInventoryBatchDto } from './dto/update-inventory-batch.dto';
import { InventoryBatchPaginationDto } from './dto/pagination.dto';

export interface PaginatedInventoryBatchesResult {
  data: InventoryBatch[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable()
export class InventoryBatchesService {
  constructor(
    @InjectRepository(InventoryBatch)
    private readonly batchRepository: Repository<InventoryBatch>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(createBatchDto: CreateInventoryBatchDto): Promise<InventoryBatch> {
    try {
      // Verify product exists
      const product = await this.productRepository.findOne({
        where: { id: createBatchDto.product_id },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${createBatchDto.product_id} not found`);
      }

      // Verify warehouse exists
      const warehouse = await this.warehouseRepository.findOne({
        where: { id: createBatchDto.warehouse_id },
      });
      if (!warehouse) {
        throw new NotFoundException(`Warehouse with ID ${createBatchDto.warehouse_id} not found`);
      }

      // Check if batch number already exists for this product and warehouse
      const existingBatch = await this.batchRepository.findOne({
        where: {
          batchNumber: createBatchDto.batch_number,
          productId: createBatchDto.product_id,
          warehouseId: createBatchDto.warehouse_id,
        },
      });

      if (existingBatch) {
        throw new ConflictException(
          `Batch with number ${createBatchDto.batch_number} already exists for this product and warehouse`
        );
      }

      // Validate required fields
      if (!createBatchDto.product_id) {
        throw new BadRequestException('product_id is required');
      }
      if (!createBatchDto.warehouse_id) {
        throw new BadRequestException('warehouse_id is required');
      }
      if (!createBatchDto.batch_number) {
        throw new BadRequestException('batch_number is required');
      }

      const batch = this.batchRepository.create({
        productId: createBatchDto.product_id,
        warehouseId: createBatchDto.warehouse_id,
        batchNumber: createBatchDto.batch_number,
        barcode: createBatchDto.barcode || null,
        quantityAvailable: createBatchDto.quantity_available || 0,
        unitCost: createBatchDto.unit_cost || 0,
        manufacturingDate: createBatchDto.manufacturing_date ? new Date(createBatchDto.manufacturing_date) : null,
        expiryDate: createBatchDto.expiry_date ? new Date(createBatchDto.expiry_date) : null,
        receivedDate: createBatchDto.received_date ? new Date(createBatchDto.received_date) : null,
        location: createBatchDto.location || null,
        status: (createBatchDto.status as BatchStatus) || BatchStatus.AVAILABLE,
      });

      const savedBatch = await this.batchRepository.save(batch);
      // Reload with relations
      return await this.batchRepository.findOne({
        where: { id: savedBatch.id },
        relations: ['product', 'warehouse'],
      }) || savedBatch;
    } catch (error) {
      console.error('Error in InventoryBatchesService.create:', error);
      throw error;
    }
  }

  async findAll(paginationQuery: InventoryBatchPaginationDto): Promise<PaginatedInventoryBatchesResult> {
    const { page, limit, sort, product_id, warehouse_id, status, batch_number, search } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.batchRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.product', 'product')
      .leftJoinAndSelect('batch.warehouse', 'warehouse');

    if (product_id) {
      queryBuilder.where('batch.productId = :product_id', { product_id });
    }

    if (warehouse_id) {
      if (product_id) {
        queryBuilder.andWhere('batch.warehouseId = :warehouse_id', { warehouse_id });
      } else {
        queryBuilder.where('batch.warehouseId = :warehouse_id', { warehouse_id });
      }
    }

    if (status) {
      if (product_id || warehouse_id) {
        queryBuilder.andWhere('batch.status = :status', { status });
      } else {
        queryBuilder.where('batch.status = :status', { status });
      }
    }

    if (batch_number) {
      const whereCondition = product_id || warehouse_id || status ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('batch.batchNumber ILIKE :batch_number', {
        batch_number: `%${batch_number}%`,
      });
    }

    if (search) {
      const whereCondition = product_id || warehouse_id || status || batch_number ? 'andWhere' : 'where';
      queryBuilder[whereCondition](
        '(batch.batchNumber ILIKE :search OR product.name ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Handle sorting
    if (sort) {
      const [field, order] = sort.split(':');
      queryBuilder.orderBy(`batch.${field}`, order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');
    } else {
      queryBuilder.orderBy('batch.createdAt', 'DESC');
    }

    // Get data with relations
    const data = await queryBuilder
      .take(limit)
      .skip(skip)
      .getMany();
    
    // Get total count separately
    const countQueryBuilder = this.batchRepository
      .createQueryBuilder('batch');
    
    // Apply same filters for count
    if (product_id) {
      countQueryBuilder.where('batch.productId = :product_id', { product_id });
    }
    if (warehouse_id) {
      if (product_id) {
        countQueryBuilder.andWhere('batch.warehouseId = :warehouse_id', { warehouse_id });
      } else {
        countQueryBuilder.where('batch.warehouseId = :warehouse_id', { warehouse_id });
      }
    }
    if (status) {
      if (product_id || warehouse_id) {
        countQueryBuilder.andWhere('batch.status = :status', { status });
      } else {
        countQueryBuilder.where('batch.status = :status', { status });
      }
    }
    if (batch_number) {
      const whereCondition = product_id || warehouse_id || status ? 'andWhere' : 'where';
      countQueryBuilder[whereCondition]('batch.batchNumber ILIKE :batch_number', {
        batch_number: `%${batch_number}%`,
      });
    }
    if (search) {
      const whereCondition = product_id || warehouse_id || status || batch_number ? 'andWhere' : 'where';
      countQueryBuilder[whereCondition](
        '(batch.batchNumber ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    const total = await countQueryBuilder.getCount();
    
    // Debug: Check if relations are loaded
    if (data.length > 0) {
      console.log('Sample batch relations:', {
        hasProduct: !!data[0].product,
        hasWarehouse: !!data[0].warehouse,
        productId: data[0].productId,
        warehouseId: data[0].warehouseId,
        productName: data[0].product?.name,
        warehouseName: data[0].warehouse?.name,
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

  async findOne(id: string): Promise<InventoryBatch> {
    const batch = await this.batchRepository.findOne({
      where: { id },
      relations: ['product', 'warehouse'],
    });

    if (!batch) {
      throw new NotFoundException(`Inventory batch with ID ${id} not found`);
    }

    return batch;
  }

  async update(id: string, updateBatchDto: UpdateInventoryBatchDto): Promise<InventoryBatch> {
    const batch = await this.findOne(id);

    // Verify product exists if being updated
    if (updateBatchDto.product_id && updateBatchDto.product_id !== batch.productId) {
      const product = await this.productRepository.findOne({
        where: { id: updateBatchDto.product_id },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${updateBatchDto.product_id} not found`);
      }
    }

    // Verify warehouse exists if being updated
    if (updateBatchDto.warehouse_id && updateBatchDto.warehouse_id !== batch.warehouseId) {
      const warehouse = await this.warehouseRepository.findOne({
        where: { id: updateBatchDto.warehouse_id },
      });
      if (!warehouse) {
        throw new NotFoundException(`Warehouse with ID ${updateBatchDto.warehouse_id} not found`);
      }
    }

    // Check batch number uniqueness if being updated
    if (updateBatchDto.batch_number && updateBatchDto.batch_number !== batch.batchNumber) {
      const existingBatch = await this.batchRepository.findOne({
        where: {
          batchNumber: updateBatchDto.batch_number,
          productId: updateBatchDto.product_id || batch.productId,
          warehouseId: updateBatchDto.warehouse_id || batch.warehouseId,
        },
      });

      if (existingBatch) {
        throw new ConflictException(
          `Batch with number ${updateBatchDto.batch_number} already exists for this product and warehouse`
        );
      }
    }

    if (updateBatchDto.product_id !== undefined) batch.productId = updateBatchDto.product_id;
    if (updateBatchDto.warehouse_id !== undefined) batch.warehouseId = updateBatchDto.warehouse_id;
    if (updateBatchDto.batch_number !== undefined) batch.batchNumber = updateBatchDto.batch_number;
    if (updateBatchDto.barcode !== undefined) batch.barcode = updateBatchDto.barcode || null;
    if (updateBatchDto.quantity_available !== undefined) batch.quantityAvailable = updateBatchDto.quantity_available;
    if (updateBatchDto.unit_cost !== undefined) batch.unitCost = updateBatchDto.unit_cost;
    if (updateBatchDto.manufacturing_date !== undefined) {
      batch.manufacturingDate = updateBatchDto.manufacturing_date ? new Date(updateBatchDto.manufacturing_date) : null;
    }
    if (updateBatchDto.expiry_date !== undefined) {
      batch.expiryDate = updateBatchDto.expiry_date ? new Date(updateBatchDto.expiry_date) : null;
    }
    if (updateBatchDto.received_date !== undefined) {
      batch.receivedDate = updateBatchDto.received_date ? new Date(updateBatchDto.received_date) : null;
    }
    if (updateBatchDto.location !== undefined) batch.location = updateBatchDto.location || null;
    if (updateBatchDto.status !== undefined) batch.status = updateBatchDto.status;

    const savedBatch = await this.batchRepository.save(batch);
    // Reload with relations
    return await this.batchRepository.findOne({
      where: { id: savedBatch.id },
      relations: ['product', 'warehouse'],
    }) || savedBatch;
  }

  async remove(id: string): Promise<void> {
    const batch = await this.findOne(id);
    await this.batchRepository.remove(batch);
  }
}

