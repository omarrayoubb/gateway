import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { COGS } from './entities/cogs.entity';
import { CreateCogsDto } from './dto/create-cogs.dto';
import { UpdateCogsDto } from './dto/update-cogs.dto';
import { CogsPaginationDto } from './dto/pagination.dto';
import { CalculateCogsDto } from './dto/calculate-cogs.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { InvoiceItem } from '../invoices/invoice-items/entities/invoice-item.entity';
import { InventoryValuation } from '../inventory-valuations/entities/inventory-valuation.entity';

@Injectable()
export class CogsService {
  constructor(
    @InjectRepository(COGS)
    private readonly cogsRepository: Repository<COGS>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(InventoryValuation)
    private readonly inventoryValuationRepository: Repository<InventoryValuation>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(createDto: CreateCogsDto): Promise<COGS> {
    try {
      // organization_id is optional, can be null
      const organizationId = createDto.organization_id || null;

      const cogs = this.cogsRepository.create({
        organizationId: organizationId || null,
        periodStart: new Date(createDto.period_start),
        periodEnd: new Date(createDto.period_end),
        itemId: createDto.item_id,
        quantitySold: createDto.quantity_sold,
        unitCost: createDto.unit_cost,
        totalCogs: createDto.quantity_sold * createDto.unit_cost,
        currency: 'USD',
      });

      return await this.cogsRepository.save(cogs);
    } catch (error) {
      console.error('Error in CogsService.create:', error);
      throw error;
    }
  }

  async findAll(query: CogsPaginationDto): Promise<COGS[]> {
    try {
      const where: any = {};

      if (query.period_start && query.period_end) {
        where.periodStart = Between(new Date(query.period_start), new Date(query.period_end));
      } else if (query.period_start) {
        where.periodStart = Between(new Date(query.period_start), new Date());
      }

      return await this.cogsRepository.find({
        where,
        order: { periodStart: 'DESC', createdDate: 'DESC' },
      });
    } catch (error) {
      console.error('Error in CogsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<COGS> {
    try {
      const cogs = await this.cogsRepository.findOne({ where: { id } });
      if (!cogs) {
        throw new NotFoundException(`COGS with ID ${id} not found`);
      }
      return cogs;
    } catch (error) {
      console.error('Error in CogsService.findOne:', error);
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateCogsDto): Promise<COGS> {
    try {
      const cogs = await this.findOne(id);

      if (updateDto.period_start) {
        cogs.periodStart = new Date(updateDto.period_start);
      }
      if (updateDto.period_end) {
        cogs.periodEnd = new Date(updateDto.period_end);
      }
      if (updateDto.item_id) {
        cogs.itemId = updateDto.item_id;
      }
      if (updateDto.quantity_sold !== undefined) {
        cogs.quantitySold = updateDto.quantity_sold;
      }
      if (updateDto.unit_cost !== undefined) {
        cogs.unitCost = updateDto.unit_cost;
      }

      // Recalculate total COGS
      cogs.totalCogs = cogs.quantitySold * cogs.unitCost;

      return await this.cogsRepository.save(cogs);
    } catch (error) {
      console.error('Error in CogsService.update:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const cogs = await this.findOne(id);
      await this.cogsRepository.remove(cogs);
    } catch (error) {
      console.error('Error in CogsService.remove:', error);
      throw error;
    }
  }

  async calculate(calculateDto: CalculateCogsDto): Promise<{
    period_start: string;
    period_end: string;
    total_cogs: number;
    items: Array<{
      item_id: string;
      item_code: string;
      item_name: string;
      quantity_sold: number;
      unit_cost: number;
      total_cogs: number;
    }>;
  }> {
    try {
      if (!calculateDto.period_start || !calculateDto.period_end) {
        throw new BadRequestException('period_start and period_end are required');
      }

      // Validate and parse dates
      const periodStartStr = calculateDto.period_start.trim();
      const periodEndStr = calculateDto.period_end.trim();
      
      const periodStart = new Date(periodStartStr);
      const periodEnd = new Date(periodEndStr);

      if (isNaN(periodStart.getTime())) {
        throw new BadRequestException(`Invalid date format for period_start: ${periodStartStr}`);
      }
      if (isNaN(periodEnd.getTime())) {
        throw new BadRequestException(`Invalid date format for period_end: ${periodEndStr}`);
      }

      if (periodStart > periodEnd) {
        throw new BadRequestException('period_start must be before period_end');
      }

      // Set time to start/end of day for proper date range queries
      const startOfDay = new Date(periodStart);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(periodEnd);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all invoices in the period that are sent or paid
      const invoices = await this.invoiceRepository.find({
        where: {
          invoiceDate: Between(startOfDay, endOfDay),
          status: In([InvoiceStatus.SENT, InvoiceStatus.PAID]),
        },
      });

      // Get all invoice items for these invoices
      const invoiceIds = invoices.map(inv => inv.id);
      const invoiceItems = invoiceIds.length > 0
        ? await this.invoiceItemRepository.find({
            where: { invoiceId: In(invoiceIds) },
          })
        : [];

      // Group invoice items by description (assuming description contains item info)
      // In a real system, invoice items should have item_id, but for now we'll use description
      const itemMap = new Map<string, {
        item_id: string;
        item_code: string;
        item_name: string;
        quantity_sold: number;
        unit_cost: number;
        total_cogs: number;
      }>();

      // Get inventory valuations to determine unit costs
      const inventoryValuations = await this.inventoryValuationRepository.find({
        where: {
          valuationDate: Between(startOfDay, endOfDay),
        },
      });

      // Create a map of item_id to average unit cost
      const costMap = new Map<string, number>();
      const itemQuantityMap = new Map<string, number>();

      inventoryValuations.forEach(val => {
        const itemId = val.itemId;
        const existingCost = costMap.get(itemId) || 0;
        const existingQty = itemQuantityMap.get(itemId) || 0;
        const totalCost = existingCost * existingQty + val.totalValue;
        const totalQty = existingQty + val.quantity;
        costMap.set(itemId, totalQty > 0 ? totalCost / totalQty : val.unitCost);
        itemQuantityMap.set(itemId, totalQty);
      });

      // Process invoice items
      // Note: Since invoice items don't have item_id, we'll need to match by description
      // This is a simplified implementation - in production, invoice items should have item_id
      for (const invoiceItem of invoiceItems) {
        // Try to extract item_id from description or use description as identifier
        // For now, we'll use a hash of description as item_id
        const itemKey = invoiceItem.description;

        // Try to find matching inventory valuation by description
        // This is a simplified approach - in production, use proper item_id
        const matchingValuation = inventoryValuations.find(
          val => val.itemName === invoiceItem.description || val.itemCode === invoiceItem.description
        );

        // Get unit cost from matching valuation, or from costMap if we have itemId, otherwise 0
        let unitCost = 0;
        if (matchingValuation) {
          unitCost = matchingValuation.unitCost;
          // Also try costMap as fallback for weighted average
          const costMapValue = costMap.get(matchingValuation.itemId);
          if (costMapValue !== undefined) {
            unitCost = costMapValue;
          }
        }

        if (!itemMap.has(itemKey)) {
          itemMap.set(itemKey, {
            item_id: matchingValuation?.itemId || invoiceItem.id, // Use invoice item id as fallback
            item_code: matchingValuation?.itemCode || '',
            item_name: matchingValuation?.itemName || invoiceItem.description,
            quantity_sold: 0,
            unit_cost: unitCost,
            total_cogs: 0,
          });
        }

        const item = itemMap.get(itemKey)!;
        item.quantity_sold += parseFloat(invoiceItem.quantity.toString());
        item.total_cogs = item.quantity_sold * item.unit_cost;
      }

      // Filter by item_ids if provided
      let items = Array.from(itemMap.values());
      if (calculateDto.item_ids && calculateDto.item_ids.length > 0) {
        items = items.filter(item => calculateDto.item_ids!.includes(item.item_id));
      }

      const totalCogs = items.reduce((sum, item) => sum + item.total_cogs, 0);

      return {
        period_start: calculateDto.period_start,
        period_end: calculateDto.period_end,
        total_cogs: totalCogs,
        items: items.map(item => ({
          item_id: item.item_id,
          item_code: item.item_code,
          item_name: item.item_name,
          quantity_sold: item.quantity_sold,
          unit_cost: item.unit_cost,
          total_cogs: item.total_cogs,
        })),
      };
    } catch (error) {
      console.error('Error in CogsService.calculate:', error);
      throw error;
    }
  }

  async getReport(periodStart: string, periodEnd: string): Promise<{
    period_start: string;
    period_end: string;
    summary: {
      total_cogs: number;
      total_revenue: number;
      gross_profit: number;
      gross_profit_margin: number;
    };
    items: Array<{
      item_id: string;
      item_code: string;
      item_name: string;
      quantity_sold: number;
      unit_cost: number;
      total_cogs: number;
      revenue: number;
      profit: number;
    }>;
  }> {
    try {
      if (!periodStart || !periodEnd) {
        throw new BadRequestException('period_start and period_end are required');
      }

      // Validate and parse dates
      const periodStartStr = periodStart.trim();
      const periodEndStr = periodEnd.trim();
      
      const startDate = new Date(periodStartStr);
      const endDate = new Date(periodEndStr);

      if (isNaN(startDate.getTime())) {
        throw new BadRequestException(`Invalid date format for period_start: ${periodStartStr}`);
      }
      if (isNaN(endDate.getTime())) {
        throw new BadRequestException(`Invalid date format for period_end: ${periodEndStr}`);
      }

      // Set time to start/end of day for proper date range queries
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Get COGS calculation
      const cogsData = await this.calculate({
        period_start: periodStartStr,
        period_end: periodEndStr,
      });

      // Get invoices for revenue calculation
      const invoices = await this.invoiceRepository.find({
        where: {
          invoiceDate: Between(startOfDay, endOfDay),
          status: In([InvoiceStatus.SENT, InvoiceStatus.PAID]),
        },
      });

      // Get all invoice items for these invoices
      const invoiceIds = invoices.map(inv => inv.id);
      const allInvoiceItems = invoiceIds.length > 0
        ? await this.invoiceItemRepository.find({
            where: { invoiceId: In(invoiceIds) },
          })
        : [];

      const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0);

      // Match COGS items with revenue
      const items = cogsData.items.map(cogsItem => {
        // Find matching invoice items for revenue
        const matchingItems = allInvoiceItems.filter(item =>
          item.description === cogsItem.item_name || item.description === cogsItem.item_code
        );

        const revenue = matchingItems.reduce((sum, item) => {
          return sum + parseFloat(item.amount.toString());
        }, 0);

        const profit = revenue - cogsItem.total_cogs;
        const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
          item_id: cogsItem.item_id || '',
          item_code: cogsItem.item_code || '',
          item_name: cogsItem.item_name || 'Unknown Item',
          quantity_sold: cogsItem.quantity_sold || 0,
          unit_cost: cogsItem.unit_cost || 0,
          total_cogs: cogsItem.total_cogs || 0,
          revenue: revenue || 0,
          profit: profit || 0,
        };
      });

      const totalCogs = cogsData.total_cogs;
      const grossProfit = totalRevenue - totalCogs;
      const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      return {
        period_start: periodStart,
        period_end: periodEnd,
        summary: {
          total_cogs: totalCogs,
          total_revenue: totalRevenue,
          gross_profit: grossProfit,
          gross_profit_margin: grossProfitMargin,
        },
        items: items,
      };
    } catch (error) {
      console.error('Error in CogsService.getReport:', error);
      throw error;
    }
  }
}

