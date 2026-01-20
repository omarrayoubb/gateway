import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectPaginationDto } from './dto/pagination.dto';
import { GeneralLedger } from '../general-ledger/entities/general-ledger.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(GeneralLedger)
    private readonly generalLedgerRepository: Repository<GeneralLedger>,
  ) {}

  async create(createDto: CreateProjectDto): Promise<Project> {
    // Convert empty string to null for organizationId
    const organizationId = createDto.organization_id && createDto.organization_id.trim() !== '' 
      ? createDto.organization_id 
      : null;

    // Check for duplicate project code
    const existing = await this.projectRepository.findOne({
      where: {
        projectCode: createDto.project_code,
        organizationId: organizationId === null ? IsNull() : organizationId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Project with code ${createDto.project_code} already exists`,
      );
    }

    // Validate and parse dates
    const startDate = new Date(createDto.start_date);
    if (isNaN(startDate.getTime())) {
      throw new BadRequestException(`Invalid start_date: ${createDto.start_date}`);
    }

    let endDate: Date | null = null;
    if (createDto.end_date) {
      endDate = new Date(createDto.end_date);
      if (isNaN(endDate.getTime())) {
        throw new BadRequestException(`Invalid end_date: ${createDto.end_date}`);
      }
    }

    const project = this.projectRepository.create({
      organizationId,
      projectCode: createDto.project_code,
      projectName: createDto.project_name,
      description: createDto.description,
      projectType: createDto.project_type,
      status: createDto.status || ProjectStatus.PLANNING,
      startDate,
      endDate,
      budgetedAmount: createDto.budgeted_amount || 0,
      actualAmount: 0,
      currency: createDto.currency || 'USD',
      department: createDto.department,
      projectManagerId: createDto.project_manager_id,
      costCenterId: createDto.cost_center_id,
      isActive: true,
    });

    try {
      return await this.projectRepository.save(project);
    } catch (error) {
      console.error('Error saving project to database:', error);
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new BadRequestException(
          `Project with code ${createDto.project_code} already exists`,
        );
      }
      throw error;
    }
  }

  async findAll(paginationDto: ProjectPaginationDto): Promise<Project[]> {
    const where: any = {};

    if (paginationDto.status) {
      where.status = paginationDto.status;
    }

    if (paginationDto.department) {
      where.department = paginationDto.department;
    }

    if (paginationDto.start_date || paginationDto.end_date) {
      if (paginationDto.start_date && paginationDto.end_date) {
        where.startDate = Between(
          new Date(paginationDto.start_date),
          new Date(paginationDto.end_date),
        );
      } else if (paginationDto.start_date) {
        where.startDate = MoreThanOrEqual(new Date(paginationDto.start_date));
      } else if (paginationDto.end_date) {
        where.startDate = LessThanOrEqual(new Date(paginationDto.end_date));
      }
    }

    const queryBuilder = this.projectRepository.createQueryBuilder('project').where(where);

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
      const validSortFields = ['projectCode', 'projectName', 'projectType', 'status', 'startDate', 'endDate', 'budgetedAmount', 'actualAmount', 'department', 'createdAt', 'updatedAt'];
      if (validSortFields.includes(mappedField)) {
        queryBuilder.orderBy(`project.${mappedField}`, sortOrder);
      } else {
        queryBuilder.orderBy('project.createdAt', 'DESC');
      }
    } else {
      queryBuilder.orderBy('project.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);

    if (updateDto.project_code && updateDto.project_code !== project.projectCode) {
      const existing = await this.projectRepository.findOne({
        where: { projectCode: updateDto.project_code },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Project with code ${updateDto.project_code} already exists`,
        );
      }
    }

    Object.assign(project, {
      ...(updateDto.project_code && { projectCode: updateDto.project_code }),
      ...(updateDto.project_name && { projectName: updateDto.project_name }),
      ...(updateDto.description !== undefined && { description: updateDto.description }),
      ...(updateDto.project_type && { projectType: updateDto.project_type }),
      ...(updateDto.status && { status: updateDto.status }),
      ...(updateDto.start_date && { startDate: new Date(updateDto.start_date) }),
      ...(updateDto.end_date !== undefined && { endDate: updateDto.end_date ? new Date(updateDto.end_date) : null }),
      ...(updateDto.budgeted_amount !== undefined && { budgetedAmount: updateDto.budgeted_amount }),
      ...(updateDto.currency && { currency: updateDto.currency }),
      ...(updateDto.department !== undefined && { department: updateDto.department }),
      ...(updateDto.project_manager_id !== undefined && { projectManagerId: updateDto.project_manager_id }),
      ...(updateDto.cost_center_id !== undefined && { costCenterId: updateDto.cost_center_id }),
      ...(updateDto.is_active !== undefined && { isActive: updateDto.is_active }),
    });

    // Recalculate actual amount if needed
    if (updateDto.project_code || updateDto.project_name) {
      await this.recalculateActualAmount(project.id);
    }

    return await this.projectRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
  }

  async getBudget(id: string): Promise<any> {
    const project = await this.findOne(id);

    // Calculate actual amount from General Ledger
    const actualAmount = await this.calculateActualAmount(project.id, project.projectCode);

    // Update project's actual amount
    if (project.actualAmount !== actualAmount) {
      project.actualAmount = actualAmount;
      await this.projectRepository.save(project);
    }

    const variance = project.budgetedAmount - actualAmount;
    const variancePercent = project.budgetedAmount > 0
      ? (variance / project.budgetedAmount) * 100
      : 0;

    // Get breakdown by account
    const breakdown = await this.getBudgetBreakdown(project.id, project.projectCode);

    return {
      project_id: project.id,
      project_name: project.projectName,
      budgeted_amount: project.budgetedAmount,
      actual_amount: actualAmount,
      variance,
      variance_percent: variancePercent,
      breakdown,
    };
  }

  private async calculateActualAmount(projectId: string, projectCode: string): Promise<number> {
    // Query General Ledger for transactions related to this project
    // Assuming project code is stored in reference or description
    const transactions = await this.generalLedgerRepository
      .createQueryBuilder('gl')
      .where('gl.reference LIKE :projectCode OR gl.description LIKE :projectCode', {
        projectCode: `%${projectCode}%`,
      })
      .getMany();

    // Sum all debit amounts (expenses) for this project
    const totalDebits = transactions.reduce((sum, t) => sum + parseFloat(t.debit.toString()), 0);

    return totalDebits;
  }

  private async recalculateActualAmount(projectId: string): Promise<void> {
    const project = await this.findOne(projectId);
    const actualAmount = await this.calculateActualAmount(project.id, project.projectCode);
    project.actualAmount = actualAmount;
    await this.projectRepository.save(project);
  }

  private async getBudgetBreakdown(projectId: string, projectCode: string): Promise<any[]> {
    // Get transactions grouped by account
    const transactions = await this.generalLedgerRepository
      .createQueryBuilder('gl')
      .leftJoinAndSelect('gl.account', 'account')
      .where('gl.reference LIKE :projectCode OR gl.description LIKE :projectCode', {
        projectCode: `%${projectCode}%`,
      })
      .getMany();

    // Group by account
    const accountMap = new Map<string, { accountId: string; accountCode: string; accountName: string; actual: number }>();

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
      variance: -entry.actual, // Since budgeted is 0
    }));
  }

  private mapSortField(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'project_code': 'projectCode',
      'project_name': 'projectName',
      'project_type': 'projectType',
      'start_date': 'startDate',
      'end_date': 'endDate',
      'budgeted_amount': 'budgetedAmount',
      'actual_amount': 'actualAmount',
      'created_at': 'createdAt',
    };

    return fieldMap[field] || field;
  }
}

