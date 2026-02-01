import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ReviewCyclesService } from './review-cycles.service';
import { CreateReviewCycleDto } from './dto/create-review-cycle.dto';

@Controller()
export class ReviewCyclesGrpcController {
  constructor(private readonly reviewCyclesService: ReviewCyclesService) {}

  @GrpcMethod('ReviewCycleService', 'GetReviewCycles')
  async getReviewCycles() {
    try {
      const cycles = await this.reviewCyclesService.findAll();
      return {
        reviewCycles: cycles.map(cycle => this.mapReviewCycleToProto(cycle)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get review cycles',
      });
    }
  }

  @GrpcMethod('ReviewCycleService', 'CreateReviewCycle')
  async createReviewCycle(data: any) {
    try {
      if (!data.name) {
        throw new RpcException({
          code: 3,
          message: 'name is required',
        });
      }
      if (!data.startDate) {
        throw new RpcException({
          code: 3,
          message: 'startDate is required',
        });
      }
      if (!data.endDate) {
        throw new RpcException({
          code: 3,
          message: 'endDate is required',
        });
      }

      const createDto: CreateReviewCycleDto = {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status || undefined,
      };

      const cycle = await this.reviewCyclesService.create(createDto);
      return this.mapReviewCycleToProto(cycle);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create review cycle',
      });
    }
  }

  private mapReviewCycleToProto(cycle: any) {
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
      id: cycle.id,
      name: cycle.name,
      startDate: formatDate(cycle.startDate),
      endDate: formatDate(cycle.endDate),
      status: cycle.status,
      createdAt: formatDateTime(cycle.createdAt),
    };
  }
}
