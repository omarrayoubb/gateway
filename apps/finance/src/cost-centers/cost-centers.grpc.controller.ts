import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CostCentersService } from './cost-centers.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto';
import { CostCenterPaginationDto } from './dto/pagination.dto';

@Controller()
export class CostCentersGrpcController {
  constructor(private readonly costCentersService: CostCentersService) {}

  @GrpcMethod('CostCentersService', 'GetCostCenters')
  async getCostCenters(data: any) {
    try {
      const paginationDto: CostCenterPaginationDto = {
        sort: data.sort,
        is_active: data.isActive !== undefined ? data.isActive : undefined,
        department: data.department,
        parent_id: data.parentId,
      };

      const costCenters = await this.costCentersService.findAll(paginationDto);
      return {
        costCenters: costCenters.map((costCenter) => this.mapCostCenterToProto(costCenter)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get cost centers',
      });
    }
  }

  @GrpcMethod('CostCentersService', 'GetCostCenter')
  async getCostCenter(data: { id: string }) {
    try {
      const costCenter = await this.costCentersService.findOne(data.id);
      return this.mapCostCenterToProto(costCenter);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get cost center',
      });
    }
  }

  @GrpcMethod('CostCentersService', 'CreateCostCenter')
  async createCostCenter(data: any) {
    try {
      const createDto: CreateCostCenterDto = {
        organization_id: data.organizationId || '',
        cost_center_code: data.costCenterCode,
        cost_center_name: data.costCenterName,
        description: data.description || undefined,
        department: data.department || undefined,
        parent_id: data.parentId || undefined,
        manager_id: data.managerId || undefined,
        budgeted_amount: data.budgetedAmount ? parseFloat(data.budgetedAmount) : undefined,
        currency: data.currency || undefined,
        is_active: data.isActive !== undefined ? data.isActive : undefined,
      };

      const costCenter = await this.costCentersService.create(createDto);
      return this.mapCostCenterToProto(costCenter);
    } catch (error) {
      console.error('Error creating cost center:', error);
      const errorMessage = error.message || error.toString() || 'Failed to create cost center';
      throw new RpcException({
        code: 2,
        message: errorMessage,
      });
    }
  }

  @GrpcMethod('CostCentersService', 'UpdateCostCenter')
  async updateCostCenter(data: any) {
    try {
      const updateDto: UpdateCostCenterDto = {
        ...(data.costCenterCode && { cost_center_code: data.costCenterCode }),
        ...(data.costCenterName && { cost_center_name: data.costCenterName }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.parentId !== undefined && { parent_id: data.parentId }),
        ...(data.managerId !== undefined && { manager_id: data.managerId }),
        ...(data.budgetedAmount !== undefined && { budgeted_amount: parseFloat(data.budgetedAmount) }),
        ...(data.currency && { currency: data.currency }),
        ...(data.isActive !== undefined && { is_active: data.isActive }),
      };

      const costCenter = await this.costCentersService.update(data.id, updateDto);
      return this.mapCostCenterToProto(costCenter);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to update cost center',
      });
    }
  }

  @GrpcMethod('CostCentersService', 'DeleteCostCenter')
  async deleteCostCenter(data: { id: string }) {
    try {
      await this.costCentersService.remove(data.id);
      return { success: true, message: 'Cost center deleted successfully' };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to delete cost center',
      });
    }
  }

  @GrpcMethod('CostCentersService', 'GetCostCenterBudget')
  async getCostCenterBudget(data: any) {
    try {
      const budget = await this.costCentersService.getBudget(
        data.id,
        data.periodStart,
        data.periodEnd,
      );
      return {
        costCenterId: budget.cost_center_id,
        costCenterName: budget.cost_center_name,
        periodStart: budget.period_start || '',
        periodEnd: budget.period_end || '',
        budgetedAmount: budget.budgeted_amount.toString(),
        actualAmount: budget.actual_amount.toString(),
        variance: budget.variance.toString(),
        variancePercent: budget.variance_percent.toString(),
        breakdown: budget.breakdown.map((item: any) => ({
          accountId: item.account_id,
          accountCode: item.account_code,
          accountName: item.account_name,
          budgeted: item.budgeted.toString(),
          actual: item.actual.toString(),
        })),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get cost center budget',
      });
    }
  }

  private mapCostCenterToProto(costCenter: any) {
    return {
      id: costCenter.id,
      organizationId: costCenter.organizationId || '',
      costCenterCode: costCenter.costCenterCode,
      costCenterName: costCenter.costCenterName,
      description: costCenter.description || '',
      department: costCenter.department || '',
      parentId: costCenter.parentId || '',
      parentName: costCenter.parentName || '',
      managerId: costCenter.managerId || '',
      managerName: costCenter.managerName || '',
      budgetedAmount: costCenter.budgetedAmount.toString(),
      actualAmount: costCenter.actualAmount.toString(),
      currency: costCenter.currency,
      isActive: costCenter.isActive,
      createdAt: costCenter.createdAt instanceof Date
        ? costCenter.createdAt.toISOString()
        : (costCenter.createdAt || ''),
    };
  }
}

