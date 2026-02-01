import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CompetencyAssessmentsService } from './competency-assessments.service';
import { CreateCompetencyAssessmentDto } from './dto/create-competency-assessment.dto';

@Controller()
export class CompetencyAssessmentsGrpcController {
  constructor(private readonly competencyAssessmentsService: CompetencyAssessmentsService) {}

  @GrpcMethod('CompetencyAssessmentService', 'GetCompetencyAssessments')
  async getCompetencyAssessments(data: { 
    employeeId?: string; 
    competencyId?: string;
    level?: string;
  }) {
    try {
      const query = {
        employee_id: data.employeeId,
        employeeId: data.employeeId,
        competency_id: data.competencyId,
        competencyId: data.competencyId,
        level: data.level,
      };
      const assessments = await this.competencyAssessmentsService.findAll(query);
      return {
        competencyAssessments: assessments.map(assessment => this.mapCompetencyAssessmentToProto(assessment)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get competency assessments',
      });
    }
  }

  @GrpcMethod('CompetencyAssessmentService', 'CreateCompetencyAssessment')
  async createCompetencyAssessment(data: any) {
    try {
      if (!data.employeeId) {
        throw new RpcException({
          code: 3,
          message: 'employeeId is required',
        });
      }
      if (!data.competencyId) {
        throw new RpcException({
          code: 3,
          message: 'competencyId is required',
        });
      }
      if (!data.assessedBy) {
        throw new RpcException({
          code: 3,
          message: 'assessedBy is required',
        });
      }
      if (!data.level) {
        throw new RpcException({
          code: 3,
          message: 'level is required',
        });
      }
      if (!data.assessmentDate) {
        throw new RpcException({
          code: 3,
          message: 'assessmentDate is required',
        });
      }

      const createDto: CreateCompetencyAssessmentDto = {
        employeeId: data.employeeId,
        competencyId: data.competencyId,
        assessedBy: data.assessedBy,
        level: parseInt(data.level),
        assessmentDate: data.assessmentDate,
        notes: data.notes || undefined,
      };

      const assessment = await this.competencyAssessmentsService.create(createDto);
      return this.mapCompetencyAssessmentToProto(assessment);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create competency assessment',
      });
    }
  }

  private mapCompetencyAssessmentToProto(assessment: any) {
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
      id: assessment.id,
      employeeId: assessment.employeeId,
      competencyId: assessment.competencyId,
      assessedBy: assessment.assessedBy,
      level: assessment.level || 1,
      assessmentDate: formatDate(assessment.assessmentDate),
      notes: assessment.notes || '',
      createdAt: formatDateTime(assessment.createdAt),
    };
  }
}
