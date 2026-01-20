import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectPaginationDto } from './dto/pagination.dto';

@Controller()
export class ProjectsGrpcController {
  constructor(private readonly projectsService: ProjectsService) {}

  @GrpcMethod('ProjectsService', 'GetProjects')
  async getProjects(data: any) {
    try {
      const paginationDto: ProjectPaginationDto = {
        sort: data.sort,
        status: data.status,
        department: data.department,
        start_date: data.startDate,
        end_date: data.endDate,
      };

      const projects = await this.projectsService.findAll(paginationDto);
      return {
        projects: projects.map((project) => this.mapProjectToProto(project)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get projects',
      });
    }
  }

  @GrpcMethod('ProjectsService', 'GetProject')
  async getProject(data: { id: string }) {
    try {
      const project = await this.projectsService.findOne(data.id);
      return this.mapProjectToProto(project);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get project',
      });
    }
  }

  @GrpcMethod('ProjectsService', 'CreateProject')
  async createProject(data: any) {
    try {
      const createDto: CreateProjectDto = {
        organization_id: data.organizationId || '',
        project_code: data.projectCode,
        project_name: data.projectName,
        description: data.description || undefined,
        project_type: data.projectType,
        status: data.status,
        start_date: data.startDate,
        end_date: data.endDate || undefined,
        budgeted_amount: data.budgetedAmount ? parseFloat(data.budgetedAmount) : undefined,
        currency: data.currency || undefined,
        department: data.department || undefined,
        project_manager_id: data.projectManagerId || undefined,
        cost_center_id: data.costCenterId || undefined,
      };

      const project = await this.projectsService.create(createDto);
      return this.mapProjectToProto(project);
    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage = error.message || error.toString() || 'Failed to create project';
      throw new RpcException({
        code: 2,
        message: errorMessage,
      });
    }
  }

  @GrpcMethod('ProjectsService', 'UpdateProject')
  async updateProject(data: any) {
    try {
      const updateDto: UpdateProjectDto = {
        ...(data.projectCode && { project_code: data.projectCode }),
        ...(data.projectName && { project_name: data.projectName }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.projectType && { project_type: data.projectType }),
        ...(data.status && { status: data.status }),
        ...(data.startDate && { start_date: data.startDate }),
        ...(data.endDate !== undefined && { end_date: data.endDate }),
        ...(data.budgetedAmount !== undefined && { budgeted_amount: parseFloat(data.budgetedAmount) }),
        ...(data.currency && { currency: data.currency }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.projectManagerId !== undefined && { project_manager_id: data.projectManagerId }),
        ...(data.costCenterId !== undefined && { cost_center_id: data.costCenterId }),
        ...(data.isActive !== undefined && { is_active: data.isActive }),
      };

      const project = await this.projectsService.update(data.id, updateDto);
      return this.mapProjectToProto(project);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to update project',
      });
    }
  }

  @GrpcMethod('ProjectsService', 'DeleteProject')
  async deleteProject(data: { id: string }) {
    try {
      await this.projectsService.remove(data.id);
      return { success: true, message: 'Project deleted successfully' };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to delete project',
      });
    }
  }

  @GrpcMethod('ProjectsService', 'GetProjectBudget')
  async getProjectBudget(data: { id: string }) {
    try {
      const budget = await this.projectsService.getBudget(data.id);
      return {
        projectId: budget.project_id,
        projectName: budget.project_name,
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
          variance: item.variance.toString(),
        })),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get project budget',
      });
    }
  }

  private mapProjectToProto(project: any) {
    return {
      id: project.id,
      organizationId: project.organizationId || '',
      projectCode: project.projectCode,
      projectName: project.projectName,
      description: project.description || '',
      projectType: project.projectType,
      status: project.status,
      startDate: project.startDate instanceof Date
        ? project.startDate.toISOString().split('T')[0]
        : (project.startDate || ''),
      endDate: project.endDate instanceof Date
        ? project.endDate.toISOString().split('T')[0]
        : (project.endDate || ''),
      budgetedAmount: project.budgetedAmount.toString(),
      actualAmount: project.actualAmount.toString(),
      currency: project.currency,
      department: project.department || '',
      projectManagerId: project.projectManagerId || '',
      projectManagerName: project.projectManagerName || '',
      costCenterId: project.costCenterId || '',
      isActive: project.isActive,
      createdAt: project.createdAt instanceof Date
        ? project.createdAt.toISOString()
        : (project.createdAt || ''),
    };
  }
}

