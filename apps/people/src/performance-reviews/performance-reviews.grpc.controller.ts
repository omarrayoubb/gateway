import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PerformanceReviewsService } from './performance-reviews.service';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';

@Controller()
export class PerformanceReviewsGrpcController {
  constructor(private readonly performanceReviewsService: PerformanceReviewsService) {}

  @GrpcMethod('PerformanceReviewService', 'GetPerformanceReview')
  async getPerformanceReview(data: { id: string }) {
    try {
      const review = await this.performanceReviewsService.findOne(data.id);
      return this.mapPerformanceReviewToProto(review);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2,
        message: error.message || 'Failed to get performance review',
      });
    }
  }

  @GrpcMethod('PerformanceReviewService', 'GetPerformanceReviews')
  async getPerformanceReviews(data: { sort?: string }) {
    try {
      const reviews = await this.performanceReviewsService.findAll({ sort: data.sort });
      return {
        performanceReviews: reviews.map(review => this.mapPerformanceReviewToProto(review)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get performance reviews',
      });
    }
  }

  @GrpcMethod('PerformanceReviewService', 'CreatePerformanceReview')
  async createPerformanceReview(data: any) {
    try {
      if (!data.employeeId) {
        throw new RpcException({
          code: 3,
          message: 'employeeId is required',
        });
      }
      if (!data.reviewerId) {
        throw new RpcException({
          code: 3,
          message: 'reviewerId is required',
        });
      }
      if (!data.reviewDate) {
        throw new RpcException({
          code: 3,
          message: 'reviewDate is required',
        });
      }

      const createDto: CreatePerformanceReviewDto = {
        employeeId: data.employeeId,
        reviewerId: data.reviewerId,
        reviewCycleId: data.reviewCycleId || undefined,
        reviewDate: data.reviewDate,
        rating: data.rating ? parseFloat(data.rating) : undefined,
        comments: data.comments || undefined,
        status: data.status || undefined,
      };

      const review = await this.performanceReviewsService.create(createDto);
      return this.mapPerformanceReviewToProto(review);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create performance review',
      });
    }
  }

  @GrpcMethod('PerformanceReviewService', 'UpdatePerformanceReview')
  async updatePerformanceReview(data: any) {
    try {
      const updateData: any = {};
      if (data.rating !== undefined) updateData.rating = parseFloat(data.rating);
      if (data.comments !== undefined) updateData.comments = data.comments;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.reviewDate !== undefined) updateData.reviewDate = data.reviewDate;

      const review = await this.performanceReviewsService.update(data.id, updateData);
      return this.mapPerformanceReviewToProto(review);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update performance review',
      });
    }
  }

  @GrpcMethod('PerformanceReviewService', 'DeletePerformanceReview')
  async deletePerformanceReview(data: { id: string }) {
    try {
      await this.performanceReviewsService.remove(data.id);
      return { success: true, message: 'Performance review deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete performance review',
      });
    }
  }

  private mapPerformanceReviewToProto(review: any) {
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
      id: review.id,
      employeeId: review.employeeId,
      reviewerId: review.reviewerId,
      reviewCycleId: review.reviewCycleId || '',
      reviewDate: formatDate(review.reviewDate),
      rating: review.rating ? parseFloat(review.rating.toString()) : 0,
      comments: review.comments || '',
      status: review.status,
      createdAt: formatDateTime(review.createdAt),
    };
  }
}
