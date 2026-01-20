import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { InventoryValuation, ValuationMethod } from './entities/inventory-valuation.entity';
import { CreateInventoryValuationDto } from './dto/create-inventory-valuation.dto';
import { UpdateInventoryValuationDto } from './dto/update-inventory-valuation.dto';
import { InventoryValuationPaginationDto } from './dto/pagination.dto';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class InventoryValuationsService {
  constructor(
    @InjectRepository(InventoryValuation)
    private readonly inventoryValuationRepository: Repository<InventoryValuation>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(createDto: CreateInventoryValuationDto): Promise<InventoryValuation> {
    try {
      // Auto-fetch organization_id if not provided
      let organizationId = createDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      const totalValue = createDto.quantity * createDto.unit_cost;

      const valuation = this.inventoryValuationRepository.create({
        organizationId: organizationId,
        itemId: createDto.item_id,
        itemCode: (createDto as any).item_code || null,
        itemName: (createDto as any).item_name || null,
        valuationDate: new Date(createDto.valuation_date),
        valuationMethod: createDto.valuation_method,
        quantity: createDto.quantity,
        unitCost: createDto.unit_cost,
        totalValue: totalValue,
        currency: 'USD',
      });

      return await this.inventoryValuationRepository.save(valuation);
    } catch (error) {
      console.error('Error in InventoryValuationsService.create:', error);
      throw error;
    }
  }

  async findAll(query: InventoryValuationPaginationDto): Promise<InventoryValuation[]> {
    try {
      const queryBuilder = this.inventoryValuationRepository.createQueryBuilder('valuation');

      if (query.as_of_date) {
        queryBuilder.andWhere('valuation.valuationDate <= :asOfDate', {
          asOfDate: query.as_of_date,
        });
      }

      if (query.valuation_method) {
        queryBuilder.andWhere('valuation.valuationMethod = :method', {
          method: query.valuation_method,
        });
      }

      queryBuilder.orderBy('valuation.valuationDate', 'DESC');
      queryBuilder.addOrderBy('valuation.createdDate', 'DESC');

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in InventoryValuationsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<InventoryValuation> {
    const valuation = await this.inventoryValuationRepository.findOne({
      where: { id },
    });
    if (!valuation) {
      throw new NotFoundException(`Inventory valuation with ID ${id} not found`);
    }
    return valuation;
  }

  async update(id: string, updateDto: UpdateInventoryValuationDto): Promise<InventoryValuation> {
    const valuation = await this.findOne(id);

    if (updateDto.valuation_date !== undefined) {
      valuation.valuationDate = new Date(updateDto.valuation_date);
    }
    if (updateDto.valuation_method !== undefined) {
      valuation.valuationMethod = updateDto.valuation_method;
    }
    if (updateDto.quantity !== undefined) {
      valuation.quantity = updateDto.quantity;
    }
    if (updateDto.unit_cost !== undefined) {
      valuation.unitCost = updateDto.unit_cost;
    }

    // Recalculate total value if quantity or unit_cost changed
    if (updateDto.quantity !== undefined || updateDto.unit_cost !== undefined) {
      valuation.totalValue = valuation.quantity * valuation.unitCost;
    }

    return await this.inventoryValuationRepository.save(valuation);
  }

  async remove(id: string): Promise<void> {
    const valuation = await this.findOne(id);
    await this.inventoryValuationRepository.remove(valuation);
  }

  async calculate(asOfDate: string, valuationMethod: ValuationMethod): Promise<any> {
    try {
      if (!asOfDate) {
        throw new BadRequestException('as_of_date is required');
      }
      if (!valuationMethod) {
        throw new BadRequestException('valuation_method is required');
      }

      // Get all valuations up to the as_of_date with the specified method
      const valuations = await this.inventoryValuationRepository.find({
        where: {
          valuationDate: LessThanOrEqual(new Date(asOfDate)),
          valuationMethod: valuationMethod,
        },
        order: {
          valuationDate: 'ASC',
          createdDate: 'ASC',
        },
      });

      // Group by item_id and calculate totals
      const itemMap = new Map<string, any>();

      for (const valuation of valuations) {
        const itemId = valuation.itemId;
        
        if (!itemMap.has(itemId)) {
          itemMap.set(itemId, {
            item_id: itemId,
            item_code: valuation.itemCode || '',
            item_name: valuation.itemName || '',
            quantity: 0,
            unit_cost: 0,
            total_value: 0,
            valuations: [],
          });
        }

        const item = itemMap.get(itemId);
        item.valuations.push(valuation);
      }

      // Calculate based on valuation method
      const items: any[] = [];
      let totalInventoryValue = 0;

      for (const [itemId, item] of itemMap.entries()) {
        let calculatedQuantity = 0;
        let calculatedUnitCost = 0;
        let calculatedTotalValue = 0;

        switch (valuationMethod) {
          case ValuationMethod.FIFO:
            // First In First Out - use oldest valuations first
            const fifoValuations = [...item.valuations].sort((a, b) => 
              a.valuationDate.getTime() - b.valuationDate.getTime()
            );
            for (const val of fifoValuations) {
              calculatedQuantity += val.quantity;
              calculatedTotalValue += val.totalValue;
            }
            calculatedUnitCost = calculatedQuantity > 0 ? calculatedTotalValue / calculatedQuantity : 0;
            break;

          case ValuationMethod.LIFO:
            // Last In First Out - use newest valuations first
            const lifoValuations = [...item.valuations].sort((a, b) => 
              b.valuationDate.getTime() - a.valuationDate.getTime()
            );
            for (const val of lifoValuations) {
              calculatedQuantity += val.quantity;
              calculatedTotalValue += val.totalValue;
            }
            calculatedUnitCost = calculatedQuantity > 0 ? calculatedTotalValue / calculatedQuantity : 0;
            break;

          case ValuationMethod.WEIGHTED_AVERAGE:
            // Weighted Average - average of all unit costs weighted by quantity
            let totalQuantity = 0;
            let totalValue = 0;
            for (const val of item.valuations) {
              totalQuantity += val.quantity;
              totalValue += val.totalValue;
            }
            calculatedQuantity = totalQuantity;
            calculatedUnitCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;
            calculatedTotalValue = totalValue;
            break;

          case ValuationMethod.SPECIFIC_IDENTIFICATION:
            // Specific Identification - sum all valuations
            for (const val of item.valuations) {
              calculatedQuantity += val.quantity;
              calculatedTotalValue += val.totalValue;
            }
            calculatedUnitCost = calculatedQuantity > 0 ? calculatedTotalValue / calculatedQuantity : 0;
            break;
        }

        item.quantity = calculatedQuantity;
        item.unit_cost = calculatedUnitCost;
        item.total_value = calculatedTotalValue;

        totalInventoryValue += calculatedTotalValue;
        items.push({
          item_id: item.item_id,
          item_code: item.item_code,
          item_name: item.item_name,
          quantity: calculatedQuantity,
          unit_cost: calculatedUnitCost,
          total_value: calculatedTotalValue,
        });
      }

      return {
        as_of_date: asOfDate,
        valuation_method: valuationMethod,
        total_inventory_value: totalInventoryValue,
        items: items,
      };
    } catch (error) {
      console.error('Error in InventoryValuationsService.calculate:', error);
      throw error;
    }
  }

  async syncFromBatches(batches: any[], valuationMethod: ValuationMethod = ValuationMethod.FIFO): Promise<{ created: number; updated: number; errors: string[] }> {
    const result: { created: number; updated: number; errors: string[] } = { created: 0, updated: 0, errors: [] };

    for (const batch of batches) {
      try {
        if (!batch.productId || !batch.quantityAvailable || parseFloat(batch.quantityAvailable) <= 0) {
          continue;
        }

        const quantity = parseFloat(batch.quantityAvailable || '0');
        const unitCost = parseFloat(batch.unitCost || '0');
        const receivedDate = batch.receivedDate ? new Date(batch.receivedDate) : new Date();

        // Check if valuation already exists for this item and date
        const existingValuation = await this.inventoryValuationRepository.findOne({
          where: {
            itemId: batch.productId,
            valuationDate: receivedDate,
            valuationMethod: valuationMethod,
          },
        });

        if (existingValuation) {
          // Update existing valuation
          existingValuation.quantity = quantity;
          existingValuation.unitCost = unitCost;
          existingValuation.totalValue = quantity * unitCost;
          existingValuation.itemCode = batch.productSku || existingValuation.itemCode;
          existingValuation.itemName = batch.productName || existingValuation.itemName;
          await this.inventoryValuationRepository.save(existingValuation);
          result.updated++;
        } else {
          // Create new valuation
          const createDto: CreateInventoryValuationDto = {
            item_id: batch.productId,
            valuation_date: receivedDate.toISOString().split('T')[0],
            valuation_method: valuationMethod,
            quantity: quantity,
            unit_cost: unitCost,
          };

          const valuation = await this.create({
            ...createDto,
            item_code: batch.productSku,
            item_name: batch.productName,
          } as any);
          result.created++;
        }
      } catch (error) {
        const errorMsg = `Error syncing batch ${batch.id}: ${error.message}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }

    return result;
  }
}

