import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { JobPostingsService } from './job-postings.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { JobPostingStatus } from './entities/job-posting.entity';

@Controller()
export class JobPostingsGrpcController {
  constructor(private readonly jobPostingsService: JobPostingsService) {}

  @GrpcMethod('JobPostingService', 'GetJobPostings')
  async getJobPostings(data: { sort?: string }) {
    try {
      const jobPostings = await this.jobPostingsService.findAll({ sort: data.sort });
      return {
        jobPostings: jobPostings.map(jobPosting => this.mapJobPostingToProto(jobPosting)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get job postings',
      });
    }
  }

  @GrpcMethod('JobPostingService', 'CreateJobPosting')
  async createJobPosting(data: any) {
    try {
      if (!data.title) {
        throw new RpcException({
          code: 3,
          message: 'title is required',
        });
      }

      // Validate and convert status enum
      let status: JobPostingStatus | undefined = undefined;
      if (data.status) {
        const validStatuses = Object.values(JobPostingStatus);
        if (validStatuses.includes(data.status as JobPostingStatus)) {
          status = data.status as JobPostingStatus;
        }
      }

      const createDto: CreateJobPostingDto = {
        title: data.title,
        department: data.department || undefined,
        departmentId: data.departmentId || data.department_id || undefined,
        description: data.description || undefined,
        requirements: data.requirements || undefined,
        status: status,
        postedDate: data.postedDate || data.posted_date || undefined,
        closingDate: data.closingDate || data.closing_date || undefined,
      };

      const jobPosting = await this.jobPostingsService.create(createDto);
      return this.mapJobPostingToProto(jobPosting);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create job posting',
      });
    }
  }

  @GrpcMethod('JobPostingService', 'UpdateJobPosting')
  async updateJobPosting(data: any) {
    try {
      // Validate and convert status enum
      let status: JobPostingStatus | undefined = undefined;
      if (data.status) {
        const validStatuses = Object.values(JobPostingStatus);
        if (validStatuses.includes(data.status as JobPostingStatus)) {
          status = data.status as JobPostingStatus;
        }
      }

      const updateDto: UpdateJobPostingDto = {
        title: data.title || undefined,
        department: data.department || undefined,
        departmentId: data.departmentId || data.department_id || undefined,
        description: data.description || undefined,
        requirements: data.requirements || undefined,
        status: status,
        postedDate: data.postedDate || data.posted_date || undefined,
        closingDate: data.closingDate || data.closing_date || undefined,
      };
      const jobPosting = await this.jobPostingsService.update(data.id, updateDto);
      return this.mapJobPostingToProto(jobPosting);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update job posting',
      });
    }
  }

  @GrpcMethod('JobPostingService', 'DeleteJobPosting')
  async deleteJobPosting(data: { id: string }) {
    try {
      await this.jobPostingsService.remove(data.id);
      return { success: true, message: 'Job posting deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete job posting',
      });
    }
  }

  private mapJobPostingToProto(jobPosting: any) {
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
      id: jobPosting.id,
      title: jobPosting.title,
      department: jobPosting.department || '',
      departmentId: jobPosting.departmentId || jobPosting.department_id || '',
      description: jobPosting.description || '',
      requirements: jobPosting.requirements || [],
      status: jobPosting.status,
      postedDate: formatDate(jobPosting.postedDate || jobPosting.posted_date),
      closingDate: formatDate(jobPosting.closingDate || jobPosting.closing_date),
      createdAt: formatDateTime(jobPosting.createdAt),
    };
  }
}
