import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ReviewTemplatesService } from './review-templates.service';
import { CreateReviewTemplateDto } from './dto/create-review-template.dto';

@Controller()
export class ReviewTemplatesGrpcController {
  constructor(private readonly reviewTemplatesService: ReviewTemplatesService) {}

  @GrpcMethod('ReviewTemplateService', 'GetReviewTemplates')
  async getReviewTemplates() {
    try {
      const templates = await this.reviewTemplatesService.findAll();
      return {
        reviewTemplates: templates.map(template => this.mapReviewTemplateToProto(template)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get review templates',
      });
    }
  }

  @GrpcMethod('ReviewTemplateService', 'CreateReviewTemplate')
  async createReviewTemplate(data: any) {
    try {
      if (!data.name) {
        throw new RpcException({
          code: 3,
          message: 'name is required',
        });
      }

      const createDto: CreateReviewTemplateDto = {
        name: data.name,
        description: data.description || undefined,
        sections: data.sections || undefined,
      };

      const template = await this.reviewTemplatesService.create(createDto);
      return this.mapReviewTemplateToProto(template);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create review template',
      });
    }
  }

  private mapReviewTemplateToProto(template: any) {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: template.id,
      name: template.name,
      description: template.description || '',
      sections: template.sections || [],
      createdAt: formatDateTime(template.createdAt),
    };
  }
}
