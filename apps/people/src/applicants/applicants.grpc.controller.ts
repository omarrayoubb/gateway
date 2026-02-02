import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ApplicantsService } from './applicants.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { ApplicantStatus } from './entities/applicant.entity';

@Controller()
export class ApplicantsGrpcController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @GrpcMethod('ApplicantService', 'GetApplicants')
  async getApplicants(data: { 
    sort?: string;
    jobPostingId?: string;
    status?: string;
  }) {
    try {
      const query = {
        sort: data.sort,
        job_posting_id: data.jobPostingId,
        jobPostingId: data.jobPostingId,
        status: data.status,
      };
      const applicants = await this.applicantsService.findAll(query);
      return {
        applicants: applicants.map(applicant => this.mapApplicantToProto(applicant)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get applicants',
      });
    }
  }

  @GrpcMethod('ApplicantService', 'CreateApplicant')
  async createApplicant(data: any) {
    try {
      if (!data.jobPostingId) {
        throw new RpcException({
          code: 3,
          message: 'jobPostingId is required',
        });
      }
      if (!data.name) {
        throw new RpcException({
          code: 3,
          message: 'name is required',
        });
      }
      if (!data.email) {
        throw new RpcException({
          code: 3,
          message: 'email is required',
        });
      }
      if (!data.appliedDate) {
        throw new RpcException({
          code: 3,
          message: 'appliedDate is required',
        });
      }

      // Validate and convert status enum
      let status: ApplicantStatus | undefined = undefined;
      if (data.status) {
        const validStatuses = Object.values(ApplicantStatus);
        if (validStatuses.includes(data.status as ApplicantStatus)) {
          status = data.status as ApplicantStatus;
        }
      }

      const createDto: CreateApplicantDto = {
        jobPostingId: data.jobPostingId || data.job_posting_id,
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        resumeUrl: data.resumeUrl || data.resume_url || undefined,
        coverLetter: data.coverLetter || data.cover_letter || undefined,
        status: status,
        appliedDate: data.appliedDate || data.applied_date,
      };

      const applicant = await this.applicantsService.create(createDto);
      return this.mapApplicantToProto(applicant);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create applicant',
      });
    }
  }

  @GrpcMethod('ApplicantService', 'UpdateApplicant')
  async updateApplicant(data: any) {
    try {
      // Validate and convert status enum
      let status: ApplicantStatus | undefined = undefined;
      if (data.status) {
        const validStatuses = Object.values(ApplicantStatus);
        if (validStatuses.includes(data.status as ApplicantStatus)) {
          status = data.status as ApplicantStatus;
        }
      }

      const updateDto: UpdateApplicantDto = {
        status: status,
        interviewDate: data.interviewDate || data.interview_date || undefined,
        interviewNotes: data.interviewNotes || data.interview_notes || undefined,
      };
      const applicant = await this.applicantsService.update(data.id, updateDto);
      return this.mapApplicantToProto(applicant);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update applicant',
      });
    }
  }

  @GrpcMethod('ApplicantService', 'DeleteApplicant')
  async deleteApplicant(data: { id: string }) {
    try {
      await this.applicantsService.remove(data.id);
      return { success: true, message: 'Applicant deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete applicant',
      });
    }
  }

  private mapApplicantToProto(applicant: any) {
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
      id: applicant.id,
      jobPostingId: applicant.jobPostingId || applicant.job_posting_id,
      name: applicant.name,
      email: applicant.email,
      phone: applicant.phone || '',
      resumeUrl: applicant.resumeUrl || applicant.resume_url || '',
      coverLetter: applicant.coverLetter || applicant.cover_letter || '',
      status: applicant.status,
      appliedDate: formatDate(applicant.appliedDate || applicant.applied_date),
      interviewDate: formatDate(applicant.interviewDate || applicant.interview_date),
      interviewNotes: applicant.interviewNotes || applicant.interview_notes || '',
      createdAt: formatDateTime(applicant.createdAt),
    };
  }
}
