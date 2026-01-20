import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Between, In } from 'typeorm';
import { StockImpact, TransactionType } from './entities/stock-impact.entity';
import { CreateStockImpactDto } from './dto/create-stock-impact.dto';
import { UpdateStockImpactDto } from './dto/update-stock-impact.dto';
import { StockImpactPaginationDto } from './dto/pagination.dto';
import { CalculateStockImpactDto } from './dto/calculate-stock-impact.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { InvoiceItem } from '../invoices/invoice-items/entities/invoice-item.entity';
import { PurchaseBill, PurchaseBillStatus } from '../purchase-bills/entities/purchase-bill.entity';
import { PurchaseBillItem } from '../purchase-bills/purchase-bill-items/entities/purchase-bill-item.entity';
import { InventoryAdjustment, AdjustmentStatus } from '../inventory-adjustments/entities/inventory-adjustment.entity';
import { Account, AccountType } from '../accounts/entities/account.entity';
import { InventoryValuation } from '../inventory-valuations/entities/inventory-valuation.entity';

@Injectable()
export class StockImpactsService {
  constructor(
    @InjectRepository(StockImpact)
    private readonly stockImpactRepository: Repository<StockImpact>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(PurchaseBill)
    private readonly purchaseBillRepository: Repository<PurchaseBill>,
    @InjectRepository(PurchaseBillItem)
    private readonly purchaseBillItemRepository: Repository<PurchaseBillItem>,
    @InjectRepository(InventoryAdjustment)
    private readonly inventoryAdjustmentRepository: Repository<InventoryAdjustment>,
    @InjectRepository(InventoryValuation)
    private readonly inventoryValuationRepository: Repository<InventoryValuation>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(createDto: CreateStockImpactDto): Promise<StockImpact> {
    try {
      let organizationId = createDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      const totalCost = createDto.total_cost ?? (createDto.quantity * createDto.unit_cost);

      const stockImpact = this.stockImpactRepository.create({
        organizationId: organizationId,
        transactionDate: new Date(createDto.transaction_date),
        transactionType: createDto.transaction_type,
        itemId: createDto.item_id,
        quantity: createDto.quantity,
        unitCost: createDto.unit_cost,
        totalCost: totalCost,
        inventoryAccountId: createDto.inventory_account_id || null,
        cogsAccountId: createDto.cogs_account_id || null,
        expenseAccountId: createDto.expense_account_id || null,
        referenceId: createDto.reference_id || null,
        referenceType: createDto.reference_type || null,
      });

      return await this.stockImpactRepository.save(stockImpact);
    } catch (error) {
      console.error('Error in StockImpactsService.create:', error);
      throw error;
    }
  }

  async findAll(query: StockImpactPaginationDto): Promise<StockImpact[]> {
    try {
      const queryBuilder = this.stockImpactRepository.createQueryBuilder('stockImpact');

      if (query.period_start && query.period_end) {
        const startDate = new Date(query.period_start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(query.period_end);
        endDate.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('stockImpact.transactionDate BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      }

      queryBuilder.orderBy('stockImpact.transactionDate', 'DESC');

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in StockImpactsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<StockImpact> {
    try {
      const stockImpact = await this.stockImpactRepository.findOne({
        where: { id },
      });

      if (!stockImpact) {
        throw new NotFoundException(`Stock impact with ID ${id} not found`);
      }

      return stockImpact;
    } catch (error) {
      console.error('Error in StockImpactsService.findOne:', error);
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateStockImpactDto): Promise<StockImpact> {
    try {
      const stockImpact = await this.findOne(id);

      Object.assign(stockImpact, {
        ...(updateDto.transaction_date && { transactionDate: new Date(updateDto.transaction_date) }),
        ...(updateDto.transaction_type && { transactionType: updateDto.transaction_type }),
        ...(updateDto.item_id && { itemId: updateDto.item_id }),
        ...(updateDto.quantity !== undefined && { quantity: updateDto.quantity }),
        ...(updateDto.unit_cost !== undefined && { unitCost: updateDto.unit_cost }),
        ...(updateDto.total_cost !== undefined && { totalCost: updateDto.total_cost }),
        ...(updateDto.inventory_account_id !== undefined && { inventoryAccountId: updateDto.inventory_account_id }),
        ...(updateDto.cogs_account_id !== undefined && { cogsAccountId: updateDto.cogs_account_id }),
        ...(updateDto.expense_account_id !== undefined && { expenseAccountId: updateDto.expense_account_id }),
        ...(updateDto.reference_id !== undefined && { referenceId: updateDto.reference_id }),
        ...(updateDto.reference_type !== undefined && { referenceType: updateDto.reference_type }),
      });

      return await this.stockImpactRepository.save(stockImpact);
    } catch (error) {
      console.error('Error in StockImpactsService.update:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const stockImpact = await this.findOne(id);
      await this.stockImpactRepository.remove(stockImpact);
    } catch (error) {
      console.error('Error in StockImpactsService.remove:', error);
      throw error;
    }
  }

  async calculate(calculateDto: CalculateStockImpactDto): Promise<StockImpact[]> {
    try {
      if (!calculateDto.period_start || !calculateDto.period_end) {
        throw new BadRequestException('period_start and period_end are required');
      }

      // Validate and parse dates
      const periodStartStr = calculateDto.period_start.trim();
      const periodEndStr = calculateDto.period_end.trim();
      
      const startDate = new Date(periodStartStr);
      const endDate = new Date(periodEndStr);

      if (isNaN(startDate.getTime())) {
        throw new BadRequestException(`Invalid date format for period_start: ${periodStartStr}`);
      }
      if (isNaN(endDate.getTime())) {
        throw new BadRequestException(`Invalid date format for period_end: ${periodEndStr}`);
      }

      // Set time boundaries
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Get organization ID
      const organizations = await this.organizationsService.findAll({});
      const organizationId = organizations.length > 0 ? organizations[0].id : null;

      // Find accounts
      const inventoryAccount = await this.accountRepository.findOne({
        where: {
          accountType: AccountType.ASSET,
          accountSubtype: 'inventory',
          organizationId: organizationId === null ? IsNull() : organizationId,
        },
      });

      const cogsAccount = await this.accountRepository.findOne({
        where: {
          accountType: AccountType.EXPENSE,
          accountSubtype: 'cogs',
          organizationId: organizationId === null ? IsNull() : organizationId,
        },
      });

      const expenseAccount = await this.accountRepository.findOne({
        where: {
          accountType: AccountType.EXPENSE,
          organizationId: organizationId === null ? IsNull() : organizationId,
        },
      });

      const stockImpacts: StockImpact[] = [];

      // 1. Process SALES (Invoices) - Reduce inventory, increase COGS
      const invoices = await this.invoiceRepository.find({
        where: {
          invoiceDate: Between(startOfDay, endOfDay),
          status: In([InvoiceStatus.SENT, InvoiceStatus.PAID]),
        },
      });

      if (invoices.length > 0) {
        const invoiceIds = invoices.map(inv => inv.id);
        const invoiceItems = await this.invoiceItemRepository.find({
          where: { invoiceId: In(invoiceIds) },
        });

        // Get inventory valuations to determine unit costs
        const inventoryValuations = await this.inventoryValuationRepository.find({
          where: {
            valuationDate: Between(startOfDay, endOfDay),
          },
        });

        for (const invoiceItem of invoiceItems) {
          // Skip if item_ids filter is provided and this item doesn't match
          if (calculateDto.item_ids && calculateDto.item_ids.length > 0) {
            // Try to match by description (since invoice items don't have item_id)
            const matchingValuation = inventoryValuations.find(
              val => val.itemName === invoiceItem.description || val.itemCode === invoiceItem.description
            );
            if (!matchingValuation || !calculateDto.item_ids.includes(matchingValuation.itemId)) {
              continue;
            }
          }

          const matchingValuation = inventoryValuations.find(
            val => val.itemName === invoiceItem.description || val.itemCode === invoiceItem.description
          );

          const unitCost = matchingValuation?.unitCost || 0;
          const quantity = parseFloat(invoiceItem.quantity.toString());
          const totalCost = quantity * unitCost;

          const stockImpact = this.stockImpactRepository.create({
            organizationId: organizationId,
            transactionDate: invoices.find(inv => inv.id === invoiceItem.invoiceId)?.invoiceDate || startDate,
            transactionType: TransactionType.SALE,
            itemId: matchingValuation?.itemId || invoiceItem.id, // Fallback to invoice item id
            itemCode: matchingValuation?.itemCode || null,
            itemName: matchingValuation?.itemName || invoiceItem.description,
            quantity: -quantity, // Negative for sales (reduces inventory)
            unitCost: unitCost,
            totalCost: -totalCost, // Negative for sales
            inventoryAccountId: inventoryAccount?.id || null,
            cogsAccountId: cogsAccount?.id || null,
            expenseAccountId: null,
            referenceId: invoiceItem.invoiceId,
            referenceType: 'invoice',
          });

          stockImpacts.push(stockImpact);
        }
      }

      // 2. Process PURCHASES (Purchase Bills) - Increase inventory
      const purchaseBills = await this.purchaseBillRepository.find({
        where: {
          billDate: Between(startOfDay, endOfDay),
          status: In([PurchaseBillStatus.APPROVED, PurchaseBillStatus.PAID]),
        },
      });

      if (purchaseBills.length > 0) {
        const billIds = purchaseBills.map(bill => bill.id);
        const billItems = await this.purchaseBillItemRepository.find({
          where: { purchaseBillId: In(billIds) },
        });

        for (const billItem of billItems) {
          // Skip if item_ids filter is provided and this item doesn't match
          if (calculateDto.item_ids && calculateDto.item_ids.length > 0) {
            // Purchase bill items don't have item_id, so we'll include all if no filter
            // In a real system, purchase bills should have item_id
          }

          const quantity = parseFloat(billItem.quantity.toString());
          const unitCost = parseFloat(billItem.unitPrice.toString());
          const totalCost = quantity * unitCost;

          const stockImpact = this.stockImpactRepository.create({
            organizationId: organizationId,
            transactionDate: purchaseBills.find(bill => bill.id === billItem.purchaseBillId)?.billDate || startDate,
            transactionType: TransactionType.PURCHASE,
            itemId: billItem.id, // Fallback to bill item id
            itemCode: null,
            itemName: billItem.description,
            quantity: quantity, // Positive for purchases (increases inventory)
            unitCost: unitCost,
            totalCost: totalCost, // Positive for purchases
            inventoryAccountId: inventoryAccount?.id || null,
            cogsAccountId: null,
            expenseAccountId: null,
            referenceId: billItem.purchaseBillId,
            referenceType: 'purchase_bill',
          });

          stockImpacts.push(stockImpact);
        }
      }

      // 3. Process ADJUSTMENTS (Inventory Adjustments) - Impact inventory and expense
      const adjustments = await this.inventoryAdjustmentRepository.find({
        where: {
          adjustmentDate: Between(startOfDay, endOfDay),
          status: AdjustmentStatus.POSTED,
        },
      });

      for (const adjustment of adjustments) {
        // Skip if item_ids filter is provided and this item doesn't match
        if (calculateDto.item_ids && calculateDto.item_ids.length > 0) {
          if (!calculateDto.item_ids.includes(adjustment.itemId)) {
            continue;
          }
        }

        const quantity = adjustment.quantityAdjusted;
        const unitCost = adjustment.unitCost;
        const totalCost = adjustment.adjustmentAmount;

        // Determine if adjustment increases or decreases inventory
        const isIncrease = adjustment.adjustmentType === 'write_up' || (adjustment.adjustmentType === 'other' && quantity > 0);
        const quantityImpact = isIncrease ? Math.abs(quantity) : -Math.abs(quantity);
        const costImpact = isIncrease ? Math.abs(totalCost) : -Math.abs(totalCost);

        const stockImpact = this.stockImpactRepository.create({
          organizationId: organizationId,
          transactionDate: adjustment.adjustmentDate,
          transactionType: TransactionType.ADJUSTMENT,
          itemId: adjustment.itemId,
          itemCode: adjustment.itemCode || null,
            itemName: null, // Will be populated from inventory if available
          quantity: quantityImpact,
          unitCost: unitCost,
          totalCost: costImpact,
          inventoryAccountId: inventoryAccount?.id || null,
          cogsAccountId: null,
          expenseAccountId: adjustment.accountId || expenseAccount?.id || null,
          referenceId: adjustment.id,
          referenceType: 'adjustment',
        });

        stockImpacts.push(stockImpact);
      }

      // 4. Process TRANSFERS (if any) - Move inventory between locations
      // Note: Transfers are not implemented yet, but the structure is ready

      // Save all stock impacts
      if (stockImpacts.length > 0) {
        await this.stockImpactRepository.save(stockImpacts);
      }

      return stockImpacts;
    } catch (error) {
      console.error('Error in StockImpactsService.calculate:', error);
      throw error;
    }
  }
}

