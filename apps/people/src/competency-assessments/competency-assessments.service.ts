import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetencyAssessment } from './entities/competency-assessment.entity';
import { CreateCompetencyAssessmentDto } from './dto/create-competency-assessment.dto';

@Injectable()
export class CompetencyAssessmentsService {
  constructor(
    @InjectRepository(CompetencyAssessment)
    private readonly competencyAssessmentRepository: Repository<CompetencyAssessment>,
  ) {}

  async findAll(query: { 
    employee_id?: string; 
    employeeId?: string; 
    competency_id?: string;
    competencyId?: string;
    level?: string;
  }): Promise<CompetencyAssessment[]> {
    const queryBuilder = this.competencyAssessmentRepository.createQueryBuilder('competency_assessment');

    // Filter by employee_id if provided
    const employeeId = query.employee_id || query.employeeId;
    if (employeeId) {
      queryBuilder.where('competency_assessment.employeeId = :employeeId', { employeeId });
    }

    // Filter by competency_id if provided
    const competencyId = query.competency_id || query.competencyId;
    if (competencyId) {
      const whereCondition = employeeId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('competency_assessment.competencyId = :competencyId', { competencyId });
    }

    // Filter by level if provided
    if (query.level) {
      const whereCondition = (employeeId || competencyId) ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('competency_assessment.level = :level', { level: parseInt(query.level) });
    }

    queryBuilder.orderBy('competency_assessment.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async create(createCompetencyAssessmentDto: CreateCompetencyAssessmentDto): Promise<CompetencyAssessment> {
    const competencyAssessment = this.competencyAssessmentRepository.create({
      ...createCompetencyAssessmentDto,
      assessmentDate: new Date(createCompetencyAssessmentDto.assessmentDate),
    });

    return await this.competencyAssessmentRepository.save(competencyAssessment);
  }
}
