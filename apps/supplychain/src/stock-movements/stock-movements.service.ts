import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement, MovementType } from './entities/stock-movement.entity';
import { Product } from '../products/entities/product.entity';
import { InventoryBatch } from '../inventory-batches/entities/inventory-batch.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';
import { StockMovementPaginationDto } from './dto/pagination.dto';

export interface PaginatedStockMovementsResult {
  data: StockMovement[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly movementRepository: Repository<StockMovement>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(InventoryBatch)
    private readonly batchRepository: Repository<InventoryBatch>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(createMovementDto: CreateStockMovementDto): Promise<StockMovement> {
    try {
      // Validate required fields
      if (!createMovementDto.product_id) {
        throw new BadRequestException('product_id is required');
      }
      if (!createMovementDto.warehouse_id) {
        throw new BadRequestException('warehouse_id is required');
      }
      if (!createMovementDto.movement_type) {
        throw new BadRequestException('movement_type is required');
      }
      if (createMovementDto.quantity === undefined || createMovementDto.quantity < 0) {
        throw new BadRequestException('quantity must be a positive number');
      }

      // Verify product exists
      const product = await this.productRepository.findOne({
        where: { id: createMovementDto.product_id },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${createMovementDto.product_id} not found`);
      }

      // Verify warehouse exists
      const warehouse = await this.warehouseRepository.findOne({
        where: { id: createMovementDto.warehouse_id },
      });
      if (!warehouse) {
        throw new NotFoundException(`Warehouse with ID ${createMovementDto.warehouse_id} not found`);
      }

      // Verify batch exists if provided
      if (createMovementDto.batch_id) {
        const batch = await this.batchRepository.findOne({
          where: { id: createMovementDto.batch_id },
        });
        if (!batch) {
          throw new NotFoundException(`Inventory batch with ID ${createMovementDto.batch_id} not found`);
        }
      }

      const movement = this.movementRepository.create({
        productId: createMovementDto.product_id,
        batchId: createMovementDto.batch_id || null,
        warehouseId: createMovementDto.warehouse_id,
        movementType: createMovementDto.movement_type,
        quantity: createMovementDto.quantity,
        referenceType: createMovementDto.reference_type || null,
        referenceId: createMovementDto.reference_id || null,
        movementDate: createMovementDto.movement_date ? new Date(createMovementDto.movement_date) : new Date(),
        notes: createMovementDto.notes || null,
        userId: createMovementDto.user_id || null,
      });

      const savedMovement = await this.movementRepository.save(movement);
      
      // Reload with relations
      return await this.movementRepository.findOne({
        where: { id: savedMovement.id },
        relations: ['product', 'batch', 'warehouse'],
      }) || savedMovement;
    } catch (error) {
      console.error('Error in StockMovementsService.create:', error);
      throw error;
    }
  }

  async findAll(paginationQuery: StockMovementPaginationDto): Promise<PaginatedStockMovementsResult> {
    const { page, limit, sort, product_id, batch_id, warehouse_id, movement_type, movement_date } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.movementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('movement.batch', 'batch')
      .leftJoinAndSelect('movement.warehouse', 'warehouse');

    if (product_id) {
      queryBuilder.where('movement.productId = :product_id', { product_id });
    }

    if (batch_id) {
      if (product_id) {
        queryBuilder.andWhere('movement.batchId = :batch_id', { batch_id });
      } else {
        queryBuilder.where('movement.batchId = :batch_id', { batch_id });
      }
    }

    if (warehouse_id) {
      if (product_id || batch_id) {
        queryBuilder.andWhere('movement.warehouseId = :warehouse_id', { warehouse_id });
      } else {
        queryBuilder.where('movement.warehouseId = :warehouse_id', { warehouse_id });
      }
    }

    if (movement_type) {
      const whereCondition = product_id || batch_id || warehouse_id ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('movement.movementType = :movement_type', { movement_type });
    }

    if (movement_date) {
      const whereCondition = product_id || batch_id || warehouse_id || movement_type ? 'andWhere' : 'where';
      const date = new Date(movement_date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      queryBuilder[whereCondition]('movement.movementDate >= :startDate AND movement.movementDate < :endDate', {
        startDate: date,
        endDate: nextDay,
      });
    }

    // Handle sorting
    if (sort) {
      const [field, order] = sort.split(':');
      queryBuilder.orderBy(`movement.${field}`, order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');
    } else {
      queryBuilder.orderBy('movement.movementDate', 'DESC');
    }

    // Get data with relations
    const data = await queryBuilder
      .take(limit)
      .skip(skip)
      .getMany();
    
    // Debug: Check if relations are loaded
    if (data.length > 0) {
      console.log('Sample movement relations:', {
        hasProduct: !!data[0].product,
        hasWarehouse: !!data[0].warehouse,
        hasBatch: !!data[0].batch,
        productId: data[0].productId,
        warehouseId: data[0].warehouseId,
        batchId: data[0].batchId,
        productName: data[0].product?.name,
        warehouseName: data[0].warehouse?.name,
      });
    }
    
    // Get total count separately
    const countQueryBuilder = this.movementRepository.createQueryBuilder('movement');
    
    // Apply same filters for count
    if (product_id) {
      countQueryBuilder.where('movement.productId = :product_id', { product_id });
    }
    if (batch_id) {
      if (product_id) {
        countQueryBuilder.andWhere('movement.batchId = :batch_id', { batch_id });
      } else {
        countQueryBuilder.where('movement.batchId = :batch_id', { batch_id });
      }
    }
    if (warehouse_id) {
      if (product_id || batch_id) {
        countQueryBuilder.andWhere('movement.warehouseId = :warehouse_id', { warehouse_id });
      } else {
        countQueryBuilder.where('movement.warehouseId = :warehouse_id', { warehouse_id });
      }
    }
    if (movement_type) {
      const whereCondition = product_id || batch_id || warehouse_id ? 'andWhere' : 'where';
      countQueryBuilder[whereCondition]('movement.movementType = :movement_type', { movement_type });
    }
    if (movement_date) {
      const whereCondition = product_id || batch_id || warehouse_id || movement_type ? 'andWhere' : 'where';
      const date = new Date(movement_date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      countQueryBuilder[whereCondition]('movement.movementDate >= :startDate AND movement.movementDate < :endDate', {
        startDate: date,
        endDate: nextDay,
      });
    }
    
    const total = await countQueryBuilder.getCount();
    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
    };
  }

  async findOne(id: string): Promise<StockMovement> {
    const movement = await this.movementRepository.findOne({
      where: { id },
      relations: ['product', 'batch', 'warehouse'],
    });

    if (!movement) {
      throw new NotFoundException(`Stock movement with ID ${id} not found`);
    }

    return movement;
  }

  async update(id: string, updateMovementDto: UpdateStockMovementDto): Promise<StockMovement> {
    const movement = await this.findOne(id);

    // Verify product exists if being updated
    if (updateMovementDto.product_id && updateMovementDto.product_id !== movement.productId) {
      const product = await this.productRepository.findOne({
        where: { id: updateMovementDto.product_id },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${updateMovementDto.product_id} not found`);
      }
    }

    // Verify warehouse exists if being updated
    if (updateMovementDto.warehouse_id && updateMovementDto.warehouse_id !== movement.warehouseId) {
      const warehouse = await this.warehouseRepository.findOne({
        where: { id: updateMovementDto.warehouse_id },
      });
      if (!warehouse) {
        throw new NotFoundException(`Warehouse with ID ${updateMovementDto.warehouse_id} not found`);
      }
    }

    // Verify batch exists if being updated
    if (updateMovementDto.batch_id !== undefined) {
      if (updateMovementDto.batch_id && updateMovementDto.batch_id !== movement.batchId) {
        const batch = await this.batchRepository.findOne({
          where: { id: updateMovementDto.batch_id },
        });
        if (!batch) {
          throw new NotFoundException(`Inventory batch with ID ${updateMovementDto.batch_id} not found`);
        }
      }
    }

    if (updateMovementDto.product_id !== undefined) movement.productId = updateMovementDto.product_id;
    if (updateMovementDto.batch_id !== undefined) movement.batchId = updateMovementDto.batch_id || null;
    if (updateMovementDto.warehouse_id !== undefined) movement.warehouseId = updateMovementDto.warehouse_id;
    if (updateMovementDto.movement_type !== undefined) movement.movementType = updateMovementDto.movement_type;
    if (updateMovementDto.quantity !== undefined) movement.quantity = updateMovementDto.quantity;
    if (updateMovementDto.reference_type !== undefined) movement.referenceType = updateMovementDto.reference_type || null;
    if (updateMovementDto.reference_id !== undefined) movement.referenceId = updateMovementDto.reference_id || null;
    if (updateMovementDto.movement_date !== undefined) {
      movement.movementDate = updateMovementDto.movement_date ? new Date(updateMovementDto.movement_date) : new Date();
    }
    if (updateMovementDto.notes !== undefined) movement.notes = updateMovementDto.notes || null;
    if (updateMovementDto.user_id !== undefined) movement.userId = updateMovementDto.user_id || null;

    const savedMovement = await this.movementRepository.save(movement);
    // Reload with relations
    return await this.movementRepository.findOne({
      where: { id: savedMovement.id },
      relations: ['product', 'batch', 'warehouse'],
    }) || savedMovement;
  }

  async remove(id: string): Promise<void> {
    const movement = await this.findOne(id);
    await this.movementRepository.remove(movement);
  }
}

