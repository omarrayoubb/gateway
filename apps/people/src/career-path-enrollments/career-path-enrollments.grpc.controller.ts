import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CareerPathEnrollmentsService } from './career-path-enrollments.service';
import { CreateCareerPathEnrollmentDto } from './dto/create-career-path-enrollment.dto';
import { UpdateCareerPathEnrollmentDto } from './dto/update-career-path-enrollment.dto';

@Controller()
export class CareerPathEnrollmentsGrpcController {
  constructor(private readonly careerPathEnrollmentsService: CareerPathEnrollmentsService) {}

  @GrpcMethod('CareerPathEnrollmentService', 'GetCareerPathEnrollments')
  async getCareerPathEnrollments(data: { 
    employeeId?: string; 
    careerPathId?: string;
    status?: string;
  }) {
    try {
      const query = {
        employee_id: data.employeeId,
        employeeId: data.employeeId,
        career_path_id: data.careerPathId,
        careerPathId: data.careerPathId,
        status: data.status,
      };
      const enrollments = await this.careerPathEnrollmentsService.findAll(query);
      return {
        careerPathEnrollments: enrollments.map(enrollment => this.mapCareerPathEnrollmentToProto(enrollment)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get career path enrollments',
      });
    }
  }

  @GrpcMethod('CareerPathEnrollmentService', 'CreateCareerPathEnrollment')
  async createCareerPathEnrollment(data: any) {
    try {
      if (!data.employeeId) {
        throw new RpcException({
          code: 3,
          message: 'employeeId is required',
        });
      }
      if (!data.careerPathId) {
        throw new RpcException({
          code: 3,
          message: 'careerPathId is required',
        });
      }
      if (!data.enrollmentDate) {
        throw new RpcException({
          code: 3,
          message: 'enrollmentDate is required',
        });
      }

      const createDto: CreateCareerPathEnrollmentDto = {
        employeeId: data.employeeId,
        careerPathId: data.careerPathId,
        enrollmentDate: data.enrollmentDate,
        currentMilestone: data.currentMilestone ? parseInt(data.currentMilestone) : 0,
        progress: data.progress ? parseInt(data.progress) : 0,
        status: data.status || undefined,
      };

      const enrollment = await this.careerPathEnrollmentsService.create(createDto);
      return this.mapCareerPathEnrollmentToProto(enrollment);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create career path enrollment',
      });
    }
  }

  @GrpcMethod('CareerPathEnrollmentService', 'UpdateCareerPathEnrollment')
  async updateCareerPathEnrollment(data: any) {
    try {
      const updateDto: UpdateCareerPathEnrollmentDto = {
        currentMilestone: data.currentMilestone ? parseInt(data.currentMilestone) : undefined,
        progress: data.progress ? parseInt(data.progress) : undefined,
        status: data.status || undefined,
      };
      const enrollment = await this.careerPathEnrollmentsService.update(data.id, updateDto);
      return this.mapCareerPathEnrollmentToProto(enrollment);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update career path enrollment',
      });
    }
  }

  @GrpcMethod('CareerPathEnrollmentService', 'DeleteCareerPathEnrollment')
  async deleteCareerPathEnrollment(data: { id: string }) {
    try {
      await this.careerPathEnrollmentsService.remove(data.id);
      return { success: true, message: 'Career path enrollment deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete career path enrollment',
      });
    }
  }

  private mapCareerPathEnrollmentToProto(enrollment: any) {
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
      id: enrollment.id,
      employeeId: enrollment.employeeId,
      careerPathId: enrollment.careerPathId,
      enrollmentDate: formatDate(enrollment.enrollmentDate),
      currentMilestone: enrollment.currentMilestone || 0,
      progress: enrollment.progress || 0,
      status: enrollment.status,
      createdAt: formatDateTime(enrollment.createdAt),
    };
  }
}
