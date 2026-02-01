import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { LearningPathsService } from './learning-paths.service';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';

@Controller()
export class LearningPathsGrpcController {
  constructor(private readonly learningPathsService: LearningPathsService) {}

  @GrpcMethod('LearningPathService', 'GetLearningPaths')
  async getLearningPaths() {
    try {
      const paths = await this.learningPathsService.findAll();
      return {
        learningPaths: paths.map(path => this.mapLearningPathToProto(path)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get learning paths',
      });
    }
  }

  @GrpcMethod('LearningPathService', 'CreateLearningPath')
  async createLearningPath(data: any) {
    try {
      if (!data.name) {
        throw new RpcException({
          code: 3,
          message: 'name is required',
        });
      }

      const createDto: CreateLearningPathDto = {
        name: data.name,
        description: data.description || undefined,
        category: data.category || undefined,
        difficultyLevel: data.difficultyLevel || undefined,
        courses: data.courses || undefined,
        mandatory: data.mandatory !== undefined ? data.mandatory : false,
      };

      const path = await this.learningPathsService.create(createDto);
      return this.mapLearningPathToProto(path);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create learning path',
      });
    }
  }

  private mapLearningPathToProto(path: any) {
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
      category: path.category || '',
      difficultyLevel: path.difficultyLevel || '',
      courses: path.courses || [],
      mandatory: path.mandatory || false,
      createdAt: formatDateTime(path.createdAt),
    };
  }
}
