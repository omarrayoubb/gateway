import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PerformanceGoalsService } from './performance-goals.service';
import { CreatePerformanceGoalDto } from './dto/create-performance-goal.dto';

@Controller()
export class PerformanceGoalsGrpcController {
  constructor(private readonly performanceGoalsService: PerformanceGoalsService) {}

  @GrpcMethod('PerformanceGoalService', 'GetPerformanceGoals')
  async getPerformanceGoals() {
    try {
      const goals = await this.performanceGoalsService.findAll();
      return {
        performanceGoals: goals.map(goal => this.mapPerformanceGoalToProto(goal)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get performance goals',
      });
    }
  }

  @GrpcMethod('PerformanceGoalService', 'CreatePerformanceGoal')
  async createPerformanceGoal(data: any) {
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

      const createDto: CreatePerformanceGoalDto = {
        employeeId: data.employeeId,
        title: data.title,
        description: data.description || undefined,
        targetDate: data.targetDate || undefined,
        status: data.status || undefined,
        progress: data.progress ? parseInt(data.progress) : 0,
      };

      const goal = await this.performanceGoalsService.create(createDto);
      return this.mapPerformanceGoalToProto(goal);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create performance goal',
      });
    }
  }

  private mapPerformanceGoalToProto(goal: any) {
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
      targetDate: formatDate(goal.targetDate),
      status: goal.status,
      progress: goal.progress || 0,
      createdAt: formatDateTime(goal.createdAt),
    };
  }
}
