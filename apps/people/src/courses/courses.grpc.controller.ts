import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseStatus, DeliveryMode } from './entities/course.entity';

@Controller()
export class CoursesGrpcController {
  constructor(private readonly coursesService: CoursesService) {}

  @GrpcMethod('CourseService', 'GetCourses')
  async getCourses(data: { sort?: string }) {
    try {
      const courses = await this.coursesService.findAll({ sort: data.sort });
      return {
        courses: courses.map(course => this.mapCourseToProto(course)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get courses',
      });
    }
  }

  @GrpcMethod('CourseService', 'CreateCourse')
  async createCourse(data: any) {
    try {
      if (!data.name) {
        throw new RpcException({
          code: 3,
          message: 'name is required',
        });
      }

      // Validate and convert deliveryMode enum
      let deliveryMode: DeliveryMode | undefined = undefined;
      if (data.deliveryMode) {
        const validModes = Object.values(DeliveryMode);
        if (validModes.includes(data.deliveryMode as DeliveryMode)) {
          deliveryMode = data.deliveryMode as DeliveryMode;
        }
      }

      // Validate and convert status enum
      let status: CourseStatus | undefined = undefined;
      if (data.status) {
        const validStatuses = Object.values(CourseStatus);
        if (validStatuses.includes(data.status as CourseStatus)) {
          status = data.status as CourseStatus;
        }
      }

      const createDto: CreateCourseDto = {
        name: data.name,
        code: data.code || undefined,
        description: data.description || undefined,
        category: data.category || undefined,
        instructor: data.instructor || undefined,
        durationHours: data.durationHours ? parseInt(data.durationHours) : undefined,
        deliveryMode: deliveryMode,
        maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : undefined,
        costPerParticipant: data.costPerParticipant ? parseFloat(data.costPerParticipant) : undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        status: status,
      };

      const course = await this.coursesService.create(createDto);
      return this.mapCourseToProto(course);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      // Handle validation errors
      if (error.response && error.response.message) {
        throw new RpcException({
          code: 3,
          message: Array.isArray(error.response.message) 
            ? error.response.message.join(', ') 
            : error.response.message,
        });
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create course',
      });
    }
  }

  @GrpcMethod('CourseService', 'UpdateCourse')
  async updateCourse(data: any) {
    try {
      const updateDto: UpdateCourseDto = {
        name: data.name || undefined,
        code: data.code || undefined,
        description: data.description || undefined,
        category: data.category || undefined,
        instructor: data.instructor || undefined,
        durationHours: data.durationHours ? parseInt(data.durationHours) : undefined,
        deliveryMode: data.deliveryMode || undefined,
        maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : undefined,
        costPerParticipant: data.costPerParticipant ? parseFloat(data.costPerParticipant) : undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        status: data.status || undefined,
      };
      const course = await this.coursesService.update(data.id, updateDto);
      return this.mapCourseToProto(course);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update course',
      });
    }
  }

  @GrpcMethod('CourseService', 'DeleteCourse')
  async deleteCourse(data: { id: string }) {
    try {
      await this.coursesService.remove(data.id);
      return { success: true, message: 'Course deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete course',
      });
    }
  }

  private mapCourseToProto(course: any) {
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
      id: course.id,
      name: course.name,
      code: course.code || '',
      description: course.description || '',
      category: course.category || '',
      instructor: course.instructor || '',
      durationHours: course.durationHours || 0,
      deliveryMode: course.deliveryMode || '',
      maxParticipants: course.maxParticipants || 0,
      costPerParticipant: course.costPerParticipant ? parseFloat(course.costPerParticipant.toString()) : 0,
      startDate: formatDate(course.startDate),
      endDate: formatDate(course.endDate),
      status: course.status,
      createdAt: formatDateTime(course.createdAt),
    };
  }
}
