import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CompetenciesService } from './competencies.service';
import { CreateCompetencyDto } from './dto/create-competency.dto';

@Controller()
export class CompetenciesGrpcController {
  constructor(private readonly competenciesService: CompetenciesService) {}

  @GrpcMethod('CompetencyService', 'GetCompetencies')
  async getCompetencies() {
    try {
      const competencies = await this.competenciesService.findAll();
      return {
        competencies: competencies.map(competency => this.mapCompetencyToProto(competency)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get competencies',
      });
    }
  }

  @GrpcMethod('CompetencyService', 'CreateCompetency')
  async createCompetency(data: any) {
    try {
      if (!data.name) {
        throw new RpcException({
          code: 3,
          message: 'name is required',
        });
      }

      const createDto: CreateCompetencyDto = {
        name: data.name,
        category: data.category || undefined,
        description: data.description || undefined,
        levels: data.levels || undefined,
      };

      const competency = await this.competenciesService.create(createDto);
      return this.mapCompetencyToProto(competency);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create competency',
      });
    }
  }

  private mapCompetencyToProto(competency: any) {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: competency.id,
      name: competency.name,
      category: competency.category || '',
      description: competency.description || '',
      levels: competency.levels || [],
      createdAt: formatDateTime(competency.createdAt),
    };
  }
}
