import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Controller()
export class GoalsGrpcController {
  constructor(private readonly goalsService: GoalsService) {}

  @GrpcMethod('GoalService', 'GetGoal')
  async getGoal(data: { id: string }) {
    try {
      const goal = await this.goalsService.findOne(data.id);
      return this.mapGoalToProto(goal);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get goal',
      });
    }
  }

  @GrpcMethod('GoalService', 'GetGoals')
  async getGoals(data: { 
    sort?: string; 
    employeeId?: string; 
    status?: string;
    category?: string;
    parentGoalId?: string;
  }) {
    try {
      const query = {
        sort: data.sort,
        employee_id: data.employeeId,
        employeeId: data.employeeId,
        status: data.status,
        category: data.category,
        parent_goal_id: data.parentGoalId,
        parentGoalId: data.parentGoalId,
      };
      const goals = await this.goalsService.findAll(query);
      return {
        goals: goals.map(goal => this.mapGoalToProto(goal)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get goals',
      });
    }
  }

  @GrpcMethod('GoalService', 'CreateGoal')
  async createGoal(data: any) {
    try {
      if (!data.employeeId) {
        throw new RpcException({
          code: 3,
          message: 'employeeId is required',
        });
      }
      if (!data.title) {
        throw new RpcException({
          code: 3,
          message: 'title is required',
        });
      }

      const createDto: CreateGoalDto = {
        employeeId: data.employeeId,
        title: data.title,
        description: data.description || undefined,
        category: data.category || undefined,
        targetDate: data.targetDate || undefined,
        status: data.status || undefined,
        progress: data.progress ? parseInt(data.progress) : 0,
        parentGoalId: data.parentGoalId || undefined,
        alignmentLevel: data.alignmentLevel || undefined,
      };

      const goal = await this.goalsService.create(createDto);
      return this.mapGoalToProto(goal);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create goal',
      });
    }
  }

  @GrpcMethod('GoalService', 'UpdateGoal')
  async updateGoal(data: any) {
    try {
      const updateDto: UpdateGoalDto = {
        employeeId: data.employeeId || undefined,
        title: data.title || undefined,
        description: data.description || undefined,
        category: data.category || undefined,
        targetDate: data.targetDate || undefined,
        status: data.status || undefined,
        progress: data.progress ? parseInt(data.progress) : undefined,
        parentGoalId: data.parentGoalId || undefined,
        alignmentLevel: data.alignmentLevel || undefined,
      };
      const goal = await this.goalsService.update(data.id, updateDto);
      return this.mapGoalToProto(goal);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update goal',
      });
    }
  }

  @GrpcMethod('GoalService', 'DeleteGoal')
  async deleteGoal(data: { id: string }) {
    try {
      await this.goalsService.remove(data.id);
      return { success: true, message: 'Goal deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete goal',
      });
    }
  }

  private mapGoalToProto(goal: any) {
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
      id: goal.id,
      employeeId: goal.employeeId,
      title: goal.title,
      description: goal.description || '',
      category: goal.category || '',
      targetDate: formatDate(goal.targetDate),
      status: goal.status,
      progress: goal.progress || 0,
      parentGoalId: goal.parentGoalId || '',
      alignmentLevel: goal.alignmentLevel,
      createdAt: formatDateTime(goal.createdAt),
    };
  }
}
