import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Applicant } from './entities/applicant.entity';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';

@Injectable()
export class ApplicantsService {
  constructor(
    @InjectRepository(Applicant)
    private readonly applicantRepository: Repository<Applicant>,
  ) {}

  async create(createApplicantDto: CreateApplicantDto): Promise<Applicant> {
    const applicant = this.applicantRepository.create({
      ...createApplicantDto,
      appliedDate: new Date(createApplicantDto.appliedDate),
    });

    return await this.applicantRepository.save(applicant);
  }

  async findAll(query: { 
    sort?: string;
    job_posting_id?: string;
    jobPostingId?: string;
    status?: string;
  }): Promise<Applicant[]> {
    const queryBuilder = this.applicantRepository.createQueryBuilder('applicant');

    // Filter by job_posting_id if provided
    const jobPostingId = query.job_posting_id || query.jobPostingId;
    if (jobPostingId) {
      queryBuilder.where('applicant.jobPostingId = :jobPostingId', { jobPostingId });
    }

    // Filter by status if provided
    if (query.status) {
      const whereCondition = jobPostingId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('applicant.status = :status', { status: query.status });
    }

    // Handle sorting
    if (query.sort) {
      const sortField = query.sort.startsWith('-') ? query.sort.substring(1) : query.sort;
      const order = query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap: Record<string, string> = {
        // Support both API styles: created_at and created_date
        created_at: 'createdAt',
        created_date: 'createdAt',
        applied_date: 'appliedDate',
        interview_date: 'interviewDate',
      };
      const dbField = fieldMap[sortField] || sortField;
      queryBuilder.orderBy(`applicant.${dbField}`, order);
    } else {
      queryBuilder.orderBy('applicant.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Applicant> {
    const applicant = await this.applicantRepository.findOne({
      where: { id },
    });

    if (!applicant) {
      throw new NotFoundException(`Applicant with ID ${id} not found`);
    }

    return applicant;
  }

  async update(id: string, updateApplicantDto: UpdateApplicantDto): Promise<Applicant> {
    const applicant = await this.findOne(id);
    
    const updateData: any = { ...updateApplicantDto };
    if (updateApplicantDto.interviewDate) {
      updateData.interviewDate = new Date(updateApplicantDto.interviewDate);
    }

    Object.assign(applicant, updateData);
    return await this.applicantRepository.save(applicant);
  }

  async remove(id: string): Promise<void> {
    const applicant = await this.findOne(id);
    await this.applicantRepository.remove(applicant);
  }
}
