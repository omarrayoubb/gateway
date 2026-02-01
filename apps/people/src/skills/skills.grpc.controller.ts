import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';

@Controller()
export class SkillsGrpcController {
  constructor(private readonly skillsService: SkillsService) {}

  @GrpcMethod('SkillService', 'GetSkills')
  async getSkills() {
    try {
      const skills = await this.skillsService.findAll();
      return {
        skills: skills.map(skill => this.mapSkillToProto(skill)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get skills',
      });
    }
  }

  @GrpcMethod('SkillService', 'CreateSkill')
  async createSkill(data: any) {
    try {
      if (!data.name) {
        throw new RpcException({
          code: 3,
          message: 'name is required',
        });
      }

      const createDto: CreateSkillDto = {
        name: data.name,
        category: data.category || undefined,
        description: data.description || undefined,
      };

      const skill = await this.skillsService.create(createDto);
      return this.mapSkillToProto(skill);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create skill',
      });
    }
  }

  private mapSkillToProto(skill: any) {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: skill.id,
      name: skill.name,
      category: skill.category || '',
      description: skill.description || '',
      createdAt: formatDateTime(skill.createdAt),
    };
  }
}
