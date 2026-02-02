import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CareerPathsService } from './career-paths.service';
import { CreateCareerPathDto } from './dto/create-career-path.dto';

@Controller()
export class CareerPathsGrpcController {
  constructor(private readonly careerPathsService: CareerPathsService) {}

  @GrpcMethod('CareerPathService', 'GetCareerPaths')
  async getCareerPaths() {
    try {
      const paths = await this.careerPathsService.findAll();
      return {
        careerPaths: paths.map(path => this.mapCareerPathToProto(path)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get career paths',
      });
    }
  }

  @GrpcMethod('CareerPathService', 'CreateCareerPath')
  async createCareerPath(data: any) {
    try {
      if (!data.name) {
        throw new RpcException({
          code: 3,
          message: 'name is required',
        });
      }

      const createDto: CreateCareerPathDto = {
        name: data.name,
        description: data.description || undefined,
        startingRole: data.startingRole || data.starting_role || undefined,
        targetRole: data.targetRole || data.target_role || undefined,
        department: data.department || undefined,
        estimatedDurationYears: data.estimatedDurationYears || data.estimated_duration_years 
          ? parseInt(data.estimatedDurationYears || data.estimated_duration_years) 
          : undefined,
        difficultyLevel: data.difficultyLevel || data.difficulty_level || undefined,
        requiredSkills: data.requiredSkills || data.required_skills || undefined,
        requiredCompetencies: data.requiredCompetencies || data.required_competencies || undefined,
        milestones: data.milestones || undefined,
      };

      const path = await this.careerPathsService.create(createDto);
      return this.mapCareerPathToProto(path);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create career path',
      });
    }
  }

  private mapCareerPathToProto(path: any) {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: path.id,
      name: path.name,
      description: path.description || '',
      startingRole: path.startingRole || path.starting_role || '',
      targetRole: path.targetRole || path.target_role || '',
      department: path.department || '',
      estimatedDurationYears: path.estimatedDurationYears || path.estimated_duration_years || 0,
      difficultyLevel: path.difficultyLevel || path.difficulty_level || '',
      requiredSkills: path.requiredSkills || path.required_skills || [],
      requiredCompetencies: path.requiredCompetencies || path.required_competencies || [],
      milestones: path.milestones || [],
      createdAt: formatDateTime(path.createdAt),
    };
  }
}
