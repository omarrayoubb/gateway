import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CostCenter } from './entities/cost-center.entity';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto';
import { CostCenterPaginationDto } from './dto/pagination.dto';
import { GeneralLedger } from '../general-ledger/entities/general-ledger.entity';

@Injectable()
export class CostCentersService {
  constructor(
    @InjectRepository(CostCenter)
    private readonly costCenterRepository: Repository<CostCenter>,
    @InjectRepository(GeneralLedger)
    private readonly generalLedgerRepository: Repository<GeneralLedger>,
  ) {}

  async create(createDto: CreateCostCenterDto): Promise<CostCenter> {
    // Convert empty string to null for organizationId
    const organizationId = createDto.organization_id && createDto.organization_id.trim() !== '' 
      ? createDto.organization_id 
      : null;

    // Check for duplicate cost center code
    const existing = await this.costCenterRepository.findOne({
      where: {
        costCenterCode: createDto.cost_center_code,
        organizationId: organizationId === null ? IsNull() : organizationId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Cost center with code ${createDto.cost_center_code} already exists`,
      );
    }

    // Validate parent if provided
    let parent: CostCenter | null = null;
    let parentName: string | null = null;
    if (createDto.parent_id) {
      parent = await this.costCenterRepository.findOne({
        where: { id: createDto.parent_id },
      });
      if (!parent) {
        throw new NotFoundException(`Parent cost center with ID ${createDto.parent_id} not found`);
      }
      parentName = parent.costCenterName;
    }

    const costCenter = this.costCenterRepository.create({
      organizationId,
      costCenterCode: createDto.cost_center_code,
      costCenterName: createDto.cost_center_name,
      description: createDto.description,
      department: createDto.department,
      parentId: createDto.parent_id || null,
      parentName,
      managerId: createDto.manager_id || null,
      budgetedAmount: createDto.budgeted_amount || 0,
      actualAmount: 0,
      currency: createDto.currency || 'USD',
      isActive: createDto.is_active !== undefined ? createDto.is_active : true,
    });

    try {
      return await this.costCenterRepository.save(costCenter);
    } catch (error) {
      console.error('Error saving cost center to database:', error);
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new BadRequestException(
          `Cost center with code ${createDto.cost_center_code} already exists`,
        );
      }
      throw error;
    }
  }

  async findAll(paginationDto: CostCenterPaginationDto): Promise<CostCenter[]> {
    const where: any = {};

    if (paginationDto.is_active !== undefined) {
      where.isActive = paginationDto.is_active;
    }

    if (paginationDto.department) {
      where.department = paginationDto.department;
    }

    if (paginationDto.parent_id) {
      where.parentId = paginationDto.parent_id;
    }

    const queryBuilder = this.costCenterRepository.createQueryBuilder('costCenter').where(where);

    if (paginationDto.sort) {
      let sortField = paginationDto.sort.trim();
      let sortOrder: 'ASC' | 'DESC' = 'ASC';

      if (sortField.startsWith('-')) {
        sortField = sortField.substring(1).trim();
        sortOrder = 'DESC';
      } else if (sortField.includes(':')) {
        const [field, order] = sortField.split(':');
        sortField = field.trim();
        sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      }

      const mappedField = this.mapSortField(sortField);
      const validSortFields = ['costCenterCode', 'costCenterName', 'department', 'budgetedAmount', 'actualAmount', 'createdAt', 'updatedAt'];
      if (validSortFields.includes(mappedField)) {
        queryBuilder.orderBy(`costCenter.${mappedField}`, sortOrder);
      } else {
        queryBuilder.orderBy('costCenter.createdAt', 'DESC');
      }
    } else {
      queryBuilder.orderBy('costCenter.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<CostCenter> {
    const costCenter = await this.costCenterRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!costCenter) {
      throw new NotFoundException(`Cost center with ID ${id} not found`);
    }

    return costCenter;
  }

  async update(id: string, updateDto: UpdateCostCenterDto): Promise<CostCenter> {
    const costCenter = await this.findOne(id);

    if (updateDto.cost_center_code && updateDto.cost_center_code !== costCenter.costCenterCode) {
      const existing = await this.costCenterRepository.findOne({
        where: { costCenterCode: updateDto.cost_center_code },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Cost center with code ${updateDto.cost_center_code} already exists`,
        );
      }
    }

    // Validate parent if provided
    let parentName: string | null = costCenter.parentName;
    if (updateDto.parent_id !== undefined) {
      if (updateDto.parent_id) {
        const parent = await this.costCenterRepository.findOne({
          where: { id: updateDto.parent_id },
        });
        if (!parent) {
          throw new NotFoundException(`Parent cost center with ID ${updateDto.parent_id} not found`);
        }
        parentName = parent.costCenterName;
      } else {
        parentName = null;
      }
    }

    Object.assign(costCenter, {
      ...(updateDto.cost_center_code && { costCenterCode: updateDto.cost_center_code }),
      ...(updateDto.cost_center_name && { costCenterName: updateDto.cost_center_name }),
      ...(updateDto.description !== undefined && { description: updateDto.description }),
      ...(updateDto.department !== undefined && { department: updateDto.department }),
      ...(updateDto.parent_id !== undefined && { parentId: updateDto.parent_id || null, parentName }),
      ...(updateDto.manager_id !== undefined && { managerId: updateDto.manager_id || null }),
      ...(updateDto.budgeted_amount !== undefined && { budgetedAmount: updateDto.budgeted_amount }),
      ...(updateDto.currency && { currency: updateDto.currency }),
      ...(updateDto.is_active !== undefined && { isActive: updateDto.is_active }),
    });

    // Recalculate actual amount if needed
    if (updateDto.cost_center_code || updateDto.cost_center_name) {
      await this.recalculateActualAmount(costCenter.id);
    }

    return await this.costCenterRepository.save(costCenter);
  }

  async remove(id: string): Promise<void> {
    const costCenter = await this.findOne(id);
    
    // Check if this cost center has children
    const children = await this.costCenterRepository.find({
      where: { parentId: id },
    });

    if (children.length > 0) {
      throw new BadRequestException(
        `Cannot delete cost center with ID ${id} because it has ${children.length} child cost center(s)`,
      );
    }

    await this.costCenterRepository.remove(costCenter);
  }

  async getBudget(id: string, periodStart?: string, periodEnd?: string): Promise<any> {
    const costCenter = await this.findOne(id);

    // Calculate actual amount from General Ledger
    const actualAmount = await this.calculateActualAmount(
      costCenter.id,
      costCenter.costCenterCode,
      periodStart,
      periodEnd,
    );

    // Update cost center's actual amount if no period filter
    if (!periodStart && !periodEnd) {
      if (costCenter.actualAmount !== actualAmount) {
        costCenter.actualAmount = actualAmount;
        await this.costCenterRepository.save(costCenter);
      }
    }

    const variance = costCenter.budgetedAmount - actualAmount;
    const variancePercent = costCenter.budgetedAmount > 0
      ? (variance / costCenter.budgetedAmount) * 100
      : 0;

    // Get breakdown by account
    const breakdown = await this.getBudgetBreakdown(
      costCenter.id,
      costCenter.costCenterCode,
      periodStart,
      periodEnd,
    );

    return {
      cost_center_id: costCenter.id,
      cost_center_name: costCenter.costCenterName,
      period_start: periodStart || null,
      period_end: periodEnd || null,
      budgeted_amount: costCenter.budgetedAmount,
      actual_amount: actualAmount,
      variance,
      variance_percent: variancePercent,
      breakdown,
    };
  }

  private async calculateActualAmount(
    costCenterId: string,
    costCenterCode: string,
    periodStart?: string,
    periodEnd?: string,
  ): Promise<number> {
    // Query General Ledger for transactions related to this cost center
    const queryBuilder = this.generalLedgerRepository
      .createQueryBuilder('gl')
      .where('gl.reference LIKE :costCenterCode OR gl.description LIKE :costCenterCode', {
        costCenterCode: `%${costCenterCode}%`,
      });

    if (periodStart) {
      queryBuilder.andWhere('gl.transactionDate >= :periodStart', {
        periodStart: new Date(periodStart),
      });
    }

    if (periodEnd) {
      queryBuilder.andWhere('gl.transactionDate <= :periodEnd', {
        periodEnd: new Date(periodEnd),
      });
    }

    const transactions = await queryBuilder.getMany();

    // Sum all debit amounts (expenses) for this cost center
    const totalDebits = transactions.reduce(
      (sum, t) => sum + parseFloat(t.debit.toString()),
      0,
    );

    return totalDebits;
  }

  private async recalculateActualAmount(costCenterId: string): Promise<void> {
    const costCenter = await this.findOne(costCenterId);
    const actualAmount = await this.calculateActualAmount(
      costCenter.id,
      costCenter.costCenterCode,
    );
    costCenter.actualAmount = actualAmount;
    await this.costCenterRepository.save(costCenter);
  }

  private async getBudgetBreakdown(
    costCenterId: string,
    costCenterCode: string,
    periodStart?: string,
    periodEnd?: string,
  ): Promise<any[]> {
    // Get transactions grouped by account
    const queryBuilder = this.generalLedgerRepository
      .createQueryBuilder('gl')
      .leftJoinAndSelect('gl.account', 'account')
      .where('gl.reference LIKE :costCenterCode OR gl.description LIKE :costCenterCode', {
        costCenterCode: `%${costCenterCode}%`,
      });

    if (periodStart) {
      queryBuilder.andWhere('gl.transactionDate >= :periodStart', {
        periodStart: new Date(periodStart),
      });
    }

    if (periodEnd) {
      queryBuilder.andWhere('gl.transactionDate <= :periodEnd', {
        periodEnd: new Date(periodEnd),
      });
    }

    const transactions = await queryBuilder.getMany();

    // Group by account
    const accountMap = new Map<
      string,
      { accountId: string; accountCode: string; accountName: string; actual: number }
    >();

    transactions.forEach((t) => {
      if (t.account) {
        const key = t.account.id;
        if (!accountMap.has(key)) {
          accountMap.set(key, {
            accountId: t.account.id,
            accountCode: t.account.accountCode,
            accountName: t.account.accountName,
            actual: 0,
          });
        }
        const entry = accountMap.get(key)!;
        entry.actual += parseFloat(t.debit.toString());
      }
    });

    return Array.from(accountMap.values()).map((entry) => ({
      account_id: entry.accountId,
      account_code: entry.accountCode,
      account_name: entry.accountName,
      budgeted: 0, // Would need a separate budget allocation table for this
      actual: entry.actual,
    }));
  }

  private mapSortField(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'cost_center_code': 'costCenterCode',
      'cost_center_name': 'costCenterName',
      'budgeted_amount': 'budgetedAmount',
      'actual_amount': 'actualAmount',
      'created_at': 'createdAt',
    };

    return fieldMap[field] || field;
  }
}

