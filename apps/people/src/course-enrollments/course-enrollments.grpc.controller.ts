import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CourseEnrollmentsService } from './course-enrollments.service';
import { CreateCourseEnrollmentDto } from './dto/create-course-enrollment.dto';
import { UpdateCourseEnrollmentDto } from './dto/update-course-enrollment.dto';

@Controller()
export class CourseEnrollmentsGrpcController {
  constructor(private readonly courseEnrollmentsService: CourseEnrollmentsService) {}

  @GrpcMethod('CourseEnrollmentService', 'GetCourseEnrollments')
  async getCourseEnrollments(data: { 
    employeeId?: string; 
    courseId?: string;
    status?: string;
  }) {
    try {
      const query = {
        employee_id: data.employeeId,
        employeeId: data.employeeId,
        course_id: data.courseId,
        courseId: data.courseId,
        status: data.status,
      };
      const enrollments = await this.courseEnrollmentsService.findAll(query);
      return {
        courseEnrollments: enrollments.map(enrollment => this.mapCourseEnrollmentToProto(enrollment)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get course enrollments',
      });
    }
  }

  @GrpcMethod('CourseEnrollmentService', 'CreateCourseEnrollment')
  async createCourseEnrollment(data: any) {
    try {
      if (!data.employeeId) {
        throw new RpcException({
          code: 3,
          message: 'employeeId is required',
        });
      }
      if (!data.courseId) {
        throw new RpcException({
          code: 3,
          message: 'courseId is required',
        });
      }
      if (!data.enrollmentDate) {
        throw new RpcException({
          code: 3,
          message: 'enrollmentDate is required',
        });
      }

      const createDto: CreateCourseEnrollmentDto = {
        employeeId: data.employeeId,
        courseId: data.courseId,
        enrollmentDate: data.enrollmentDate,
        completionDate: data.completionDate || undefined,
        status: data.status || undefined,
        progress: data.progress ? parseInt(data.progress) : 0,
      };

      const enrollment = await this.courseEnrollmentsService.create(createDto);
      return this.mapCourseEnrollmentToProto(enrollment);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create course enrollment',
      });
    }
  }

  @GrpcMethod('CourseEnrollmentService', 'UpdateCourseEnrollment')
  async updateCourseEnrollment(data: any) {
    try {
      const updateDto: UpdateCourseEnrollmentDto = {
        completionDate: data.completionDate || undefined,
        status: data.status || undefined,
        progress: data.progress ? parseInt(data.progress) : undefined,
      };
      const enrollment = await this.courseEnrollmentsService.update(data.id, updateDto);
      return this.mapCourseEnrollmentToProto(enrollment);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update course enrollment',
      });
    }
  }

  @GrpcMethod('CourseEnrollmentService', 'DeleteCourseEnrollment')
  async deleteCourseEnrollment(data: { id: string }) {
    try {
      await this.courseEnrollmentsService.remove(data.id);
      return { success: true, message: 'Course enrollment deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete course enrollment',
      });
    }
  }

  private mapCourseEnrollmentToProto(enrollment: any) {
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
      courseId: enrollment.courseId,
      enrollmentDate: formatDate(enrollment.enrollmentDate),
      completionDate: formatDate(enrollment.completionDate),
      status: enrollment.status,
      progress: enrollment.progress || 0,
      createdAt: formatDateTime(enrollment.createdAt),
    };
  }
}
