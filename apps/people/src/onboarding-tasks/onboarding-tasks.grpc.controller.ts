import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { OnboardingTasksService } from './onboarding-tasks.service';
import { CreateOnboardingTaskDto } from './dto/create-onboarding-task.dto';
import { UpdateOnboardingTaskDto } from './dto/update-onboarding-task.dto';
import { OnboardingTaskStatus } from './entities/onboarding-task.entity';

@Controller()
export class OnboardingTasksGrpcController {
  constructor(private readonly onboardingTasksService: OnboardingTasksService) {}

  @GrpcMethod('OnboardingTaskService', 'GetOnboardingTasks')
  async getOnboardingTasks(data: { 
    onboardingPlanId?: string;
    assignedTo?: string;
    status?: string;
  }) {
    try {
      const query = {
        onboarding_plan_id: data.onboardingPlanId,
        onboardingPlanId: data.onboardingPlanId,
        assigned_to: data.assignedTo,
        assignedTo: data.assignedTo,
        status: data.status,
      };
      const tasks = await this.onboardingTasksService.findAll(query);
      return {
        onboardingTasks: tasks.map(task => this.mapOnboardingTaskToProto(task)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get onboarding tasks',
      });
    }
  }

  @GrpcMethod('OnboardingTaskService', 'CreateOnboardingTask')
  async createOnboardingTask(data: any) {
    try {
      if (!data.onboardingPlanId) {
        throw new RpcException({
          code: 3,
          message: 'onboardingPlanId is required',
        });
      }
      if (!data.title) {
        throw new RpcException({
          code: 3,
          message: 'title is required',
        });
      }

      // Validate and convert status enum
      let status: OnboardingTaskStatus | undefined = undefined;
      if (data.status) {
        const validStatuses = Object.values(OnboardingTaskStatus);
        if (validStatuses.includes(data.status as OnboardingTaskStatus)) {
          status = data.status as OnboardingTaskStatus;
        }
      }

      const createDto: CreateOnboardingTaskDto = {
        onboardingPlanId: data.onboardingPlanId || data.onboarding_plan_id,
        title: data.title,
        description: data.description || undefined,
        assignedTo: data.assignedTo || data.assigned_to || undefined,
        dueDate: data.dueDate || data.due_date || undefined,
        status: status,
      };

      const task = await this.onboardingTasksService.create(createDto);
      return this.mapOnboardingTaskToProto(task);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create onboarding task',
      });
    }
  }

  @GrpcMethod('OnboardingTaskService', 'UpdateOnboardingTask')
  async updateOnboardingTask(data: any) {
    try {
      // Validate and convert status enum
      let status: OnboardingTaskStatus | undefined = undefined;
      if (data.status) {
        const validStatuses = Object.values(OnboardingTaskStatus);
        if (validStatuses.includes(data.status as OnboardingTaskStatus)) {
          status = data.status as OnboardingTaskStatus;
        }
      }

      const updateDto: UpdateOnboardingTaskDto = {
        status: status,
        completedDate: data.completedDate || data.completed_date || undefined,
      };
      const task = await this.onboardingTasksService.update(data.id, updateDto);
      return this.mapOnboardingTaskToProto(task);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update onboarding task',
      });
    }
  }

  @GrpcMethod('OnboardingTaskService', 'DeleteOnboardingTask')
  async deleteOnboardingTask(data: { id: string }) {
    try {
      await this.onboardingTasksService.remove(data.id);
      return { success: true, message: 'Onboarding task deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete onboarding task',
      });
    }
  }

  private mapOnboardingTaskToProto(task: any) {
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date.split('T')[0];
      if (date instanceof Date) return date.toISOString().split('T')[0];
      return '';
    };

    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: task.id,
      onboardingPlanId: task.onboardingPlanId || task.onboarding_plan_id,
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo || task.assigned_to || '',
      dueDate: formatDate(task.dueDate || task.due_date),
      status: task.status,
      completedDate: formatDate(task.completedDate || task.completed_date),
      createdAt: formatDateTime(task.createdAt),
    };
  }
}
