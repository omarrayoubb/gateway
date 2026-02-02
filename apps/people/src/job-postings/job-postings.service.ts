import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';

@Injectable()
export class JobPostingsService {
  constructor(
    @InjectRepository(JobPosting)
    private readonly jobPostingRepository: Repository<JobPosting>,
  ) {}

  async create(createJobPostingDto: CreateJobPostingDto): Promise<JobPosting> {
    const jobPosting = this.jobPostingRepository.create({
      ...createJobPostingDto,
      postedDate: createJobPostingDto.postedDate 
        ? new Date(createJobPostingDto.postedDate) 
        : null,
      closingDate: createJobPostingDto.closingDate 
        ? new Date(createJobPostingDto.closingDate) 
        : null,
    });

    return await this.jobPostingRepository.save(jobPosting);
  }

  async findAll(query: { sort?: string; status?: string }): Promise<JobPosting[]> {
    const queryBuilder = this.jobPostingRepository.createQueryBuilder('job_posting');

    // Handle status filter
    if (query.status) {
      queryBuilder.andWhere('job_posting.status = :status', { status: query.status });
    }

    // Handle sorting
    if (query.sort) {
      const sortField = query.sort.startsWith('-') ? query.sort.substring(1) : query.sort;
      const order = query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap: Record<string, string> = {
        // Support both API styles: created_at and created_date
        created_at: 'createdAt',
        created_date: 'createdAt',
        posted_date: 'postedDate',
        closing_date: 'closingDate',
      };
      const dbField = fieldMap[sortField] || sortField;
      queryBuilder.orderBy(`job_posting.${dbField}`, order);
    } else {
      queryBuilder.orderBy('job_posting.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<JobPosting> {
    const jobPosting = await this.jobPostingRepository.findOne({
      where: { id },
    });

    if (!jobPosting) {
      throw new NotFoundException(`Job posting with ID ${id} not found`);
    }

    return jobPosting;
  }

  async update(id: string, updateJobPostingDto: UpdateJobPostingDto): Promise<JobPosting> {
    const jobPosting = await this.findOne(id);
    
    const updateData: any = { ...updateJobPostingDto };
    if (updateJobPostingDto.postedDate) {
      updateData.postedDate = new Date(updateJobPostingDto.postedDate);
    }
    if (updateJobPostingDto.closingDate) {
      updateData.closingDate = new Date(updateJobPostingDto.closingDate);
    }

    Object.assign(jobPosting, updateData);
    return await this.jobPostingRepository.save(jobPosting);
  }

  async remove(id: string): Promise<void> {
    const jobPosting = await this.findOne(id);
    await this.jobPostingRepository.remove(jobPosting);
  }
}
