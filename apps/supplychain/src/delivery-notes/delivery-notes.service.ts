import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DeliveryNote } from './entities/delivery-note.entity';
import { DeliveryNoteItem } from './entities/delivery-note-item.entity';
import { CreateDeliveryNoteDto } from './dto/create-delivery-note.dto';
import { UpdateDeliveryNoteDto } from './dto/update-delivery-note.dto';
import { DeliveryNotePaginationDto } from './dto/pagination.dto';
import { Product } from '../products/entities/product.entity';
import { InventoryBatch, BatchStatus } from '../inventory-batches/entities/inventory-batch.entity';
import { StockMovement, MovementType, ReferenceType } from '../stock-movements/entities/stock-movement.entity';

export interface PaginatedDeliveryNotesResult {
  data: DeliveryNote[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable()
export class DeliveryNotesService {
  constructor(
    @InjectRepository(DeliveryNote)
    private deliveryNoteRepository: Repository<DeliveryNote>,
    @InjectRepository(DeliveryNoteItem)
    private deliveryNoteItemRepository: Repository<DeliveryNoteItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(InventoryBatch)
    private batchRepository: Repository<InventoryBatch>,
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
  ) {}

  private async generateDnNumber(): Promise<string> {
    const lastDN = await this.deliveryNoteRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    });

    if (!lastDN || !lastDN.dnNumber) {
      return 'DN-001';
    }

    const match = lastDN.dnNumber.match(/DN-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return `DN-${String(num + 1).padStart(3, '0')}`;
    }

    return 'DN-001';
  }

  async create(createDeliveryNoteDto: CreateDeliveryNoteDto): Promise<DeliveryNote> {
    // Generate DN number if not provided
    let dnNumber = createDeliveryNoteDto.dnNumber;
    if (!dnNumber) {
      dnNumber = await this.generateDnNumber();
    }

    // Check if DN number already exists
    const existingDN = await this.deliveryNoteRepository.findOne({
      where: { dnNumber },
    });
    if (existingDN) {
      throw new ConflictException(`Delivery note with number ${dnNumber} already exists`);
    }

    // Validate products and batches, and check quantities
    for (const item of createDeliveryNoteDto.items) {
      const productId = item.productId || (item as any).product_id;
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      // If batch_id is provided, validate batch and check available quantity
      const batchId = item.batchId || (item as any).batch_id;
      if (batchId) {
        const batch = await this.batchRepository.findOne({
          where: { id: batchId },
        });
        if (!batch) {
          throw new NotFoundException(`Batch with ID ${batchId} not found`);
        }

        // Validate quantity doesn't exceed available stock
        if (item.quantity > batch.quantityAvailable) {
          throw new BadRequestException(
            `Insufficient stock in batch ${batch.batchNumber}. Available: ${batch.quantityAvailable}, Requested: ${item.quantity}`
          );
        }
      }
    }

    const deliveryNote = this.deliveryNoteRepository.create({
      dnNumber,
      deliveredTo: createDeliveryNoteDto.deliveredTo,
      date: new Date(createDeliveryNoteDto.date),
      taxCard: createDeliveryNoteDto.taxCard || null,
      cr: createDeliveryNoteDto.cr || null,
      items: createDeliveryNoteDto.items.map(item => ({
        productId: item.productId,
        batchId: item.batchId || null,
        quantity: item.quantity,
      })),
    });

    const savedDN = await this.deliveryNoteRepository.save(deliveryNote);
    const savedDNArray = Array.isArray(savedDN) ? savedDN : [savedDN];
    const savedDeliveryNote: DeliveryNote = savedDNArray[0];

    // Create stock movements for each item to deduct inventory
    for (const itemDto of createDeliveryNoteDto.items) {
      const productId = itemDto.productId;
      const batchId = itemDto.batchId;
      
      // If batch_id is provided, update batch quantity and create stock movement
      if (batchId) {
        const batch = await this.batchRepository.findOne({
          where: { id: batchId },
        });
        
        if (!batch) {
          throw new NotFoundException(`Batch with ID ${batchId} not found`);
        }

        // Update batch quantity by subtracting the delivered quantity
        const newQuantity = Number(batch.quantityAvailable) - itemDto.quantity;
        if (newQuantity < 0) {
          throw new BadRequestException(
            `Insufficient quantity in batch ${batch.batchNumber}. Available: ${batch.quantityAvailable}, Requested: ${itemDto.quantity}`
          );
        }
        
        batch.quantityAvailable = newQuantity;
        await this.batchRepository.save(batch);

        // Create stock movement (shipment out - deducts inventory)
        const stockMovement = this.stockMovementRepository.create({
          productId: productId,
          batchId: batchId,
          warehouseId: batch.warehouseId,
          movementType: MovementType.SHIP,
          quantity: itemDto.quantity, // Positive quantity for shipment out (deducts from inventory)
          referenceType: ReferenceType.DELIVERY_NOTE,
          referenceId: savedDeliveryNote.id,
          movementDate: new Date(createDeliveryNoteDto.date),
          notes: `Delivery Note: ${savedDeliveryNote.dnNumber}`,
        });
        await this.stockMovementRepository.save(stockMovement);
      }
    }

    return await this.findOne(savedDeliveryNote.id);
  }

  async findAll(paginationQuery: DeliveryNotePaginationDto): Promise<PaginatedDeliveryNotesResult> {
    try {
      const { page = 1, limit = 50, sort, deliveredTo, date } = paginationQuery;
      const skip = (page - 1) * limit;

      const queryBuilder = this.deliveryNoteRepository
        .createQueryBuilder('dn')
        .leftJoinAndSelect('dn.items', 'items')
        .leftJoinAndSelect('items.product', 'product')
        .leftJoinAndSelect('items.batch', 'batch');

      if (deliveredTo) {
        queryBuilder.where('dn.deliveredTo ILIKE :deliveredTo', { deliveredTo: `%${deliveredTo}%` });
      }

      if (date) {
        const whereCondition = deliveredTo ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('DATE(dn.date) = :date', { date });
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
            queryBuilder.orderBy(`dn.${sortField}`, sortOrder);
          } catch (error) {
            // If field doesn't exist, default to createdAt
            queryBuilder.orderBy('dn.createdAt', 'DESC');
          }
        } else {
          queryBuilder.orderBy('dn.createdAt', 'DESC');
        }
      } else {
        queryBuilder.orderBy('dn.createdAt', 'DESC');
      }

      const [data, total] = await queryBuilder
        .take(limit)
        .skip(skip)
        .getManyAndCount();

      // Collect all product and batch IDs to load in batch
      const productIds = new Set<string>();
      const batchIds = new Set<string>();
      for (const dn of data) {
        if (dn.items && dn.items.length > 0) {
          for (const item of dn.items) {
            if (item.productId) {
              productIds.add(item.productId);
            }
            if (item.batchId) {
              batchIds.add(item.batchId);
            }
          }
        }
      }

      // Load all products and batches in batch
      const products = productIds.size > 0 
        ? await this.productRepository.findBy({ id: In(Array.from(productIds)) })
        : [];
      const batches = batchIds.size > 0
        ? await this.batchRepository.findBy({ id: In(Array.from(batchIds)) })
        : [];
      
      const productMap = new Map(products.map(p => [p.id, p]));
      const batchMap = new Map(batches.map(b => [b.id, b]));

      // Assign products and batches to items
      for (const dn of data) {
        if (dn.items && dn.items.length > 0) {
          for (const item of dn.items) {
            if (item.productId) {
              const product = productMap.get(item.productId);
              if (product) {
                item.product = product;
              }
            }
            if (item.batchId) {
              const batch = batchMap.get(item.batchId);
              if (batch) {
                item.batch = batch;
              }
            }
          }
        }
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
      console.error('Error in DeliveryNotesService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<DeliveryNote> {
    const deliveryNote = await this.deliveryNoteRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'items.batch'],
    });
    if (!deliveryNote) {
      throw new NotFoundException(`Delivery note with ID ${id} not found`);
    }
    return deliveryNote;
  }

  async update(id: string, updateDeliveryNoteDto: UpdateDeliveryNoteDto): Promise<DeliveryNote> {
    const deliveryNote = await this.findOne(id);

    // Check if DN number is being updated and if it already exists
    if (updateDeliveryNoteDto.dnNumber && updateDeliveryNoteDto.dnNumber !== deliveryNote.dnNumber) {
      const existingDN = await this.deliveryNoteRepository.findOne({
        where: { dnNumber: updateDeliveryNoteDto.dnNumber },
      });
      if (existingDN) {
        throw new ConflictException(`Delivery note with number ${updateDeliveryNoteDto.dnNumber} already exists`);
      }
    }

    // Update items if provided
    if (updateDeliveryNoteDto.items) {
      // Validate items
      for (const item of updateDeliveryNoteDto.items) {
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

          // Validate quantity doesn't exceed available stock
          if (item.quantity > batch.quantityAvailable) {
            throw new BadRequestException(
              `Insufficient stock in batch ${batch.batchNumber}. Available: ${batch.quantityAvailable}, Requested: ${item.quantity}`
            );
          }
        }
      }

      // Remove existing items
      await this.deliveryNoteItemRepository.delete({ deliveryNoteId: id });

      // Create new items
      const newItems = updateDeliveryNoteDto.items.map(item =>
        this.deliveryNoteItemRepository.create({
          deliveryNoteId: id,
          productId: item.productId,
          batchId: item.batchId || null,
          quantity: item.quantity,
        })
      );
      await this.deliveryNoteItemRepository.save(newItems);
    }

    const updateData: any = { ...updateDeliveryNoteDto };
    if (updateDeliveryNoteDto.date) {
      updateData.date = new Date(updateDeliveryNoteDto.date);
    }
    delete updateData.items; // Remove items from update data as we handle them separately

    Object.assign(deliveryNote, updateData);
    await this.deliveryNoteRepository.save(deliveryNote);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const deliveryNote = await this.findOne(id);
    await this.deliveryNoteRepository.remove(deliveryNote);
  }

  async getProductsWithInventory(warehouseId?: string): Promise<any[]> {
    // Get all inventory batches with available stock
    const queryBuilder = this.batchRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.product', 'product')
      .leftJoinAndSelect('batch.warehouse', 'warehouse')
      .where('batch.quantityAvailable > 0')
      .andWhere('batch.status = :status', { status: BatchStatus.AVAILABLE });

    if (warehouseId) {
      queryBuilder.andWhere('batch.warehouseId = :warehouseId', { warehouseId });
    }

    const batches = await queryBuilder.getMany();

    // Group by product and aggregate available quantities
    const productMap = new Map<string, any>();
    
    for (const batch of batches) {
      if (!batch.product) continue;
      
      const productId = batch.product.id;
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          id: batch.product.id,
          name: batch.product.name,
          sku: batch.product.sku,
          description: batch.product.description,
          batches: [],
          totalAvailable: 0,
        });
      }
      
      const productData = productMap.get(productId);
      productData.batches.push({
        id: batch.id,
        batchNumber: batch.batchNumber,
        warehouseId: batch.warehouseId,
        warehouseName: batch.warehouse?.name || '',
        quantityAvailable: batch.quantityAvailable,
        expiryDate: batch.expiryDate,
        unitCost: batch.unitCost,
      });
      productData.totalAvailable += Number(batch.quantityAvailable);
    }

    return Array.from(productMap.values());
  }
}

