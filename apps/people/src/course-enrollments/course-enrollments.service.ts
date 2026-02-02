import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { CreateCourseEnrollmentDto } from './dto/create-course-enrollment.dto';
import { UpdateCourseEnrollmentDto } from './dto/update-course-enrollment.dto';

@Injectable()
export class CourseEnrollmentsService {
  constructor(
    @InjectRepository(CourseEnrollment)
    private readonly courseEnrollmentRepository: Repository<CourseEnrollment>,
  ) {}

  async create(createCourseEnrollmentDto: CreateCourseEnrollmentDto): Promise<CourseEnrollment> {
    const courseEnrollment = this.courseEnrollmentRepository.create({
      ...createCourseEnrollmentDto,
      enrollmentDate: new Date(createCourseEnrollmentDto.enrollmentDate),
      completionDate: createCourseEnrollmentDto.completionDate 
        ? new Date(createCourseEnrollmentDto.completionDate) 
        : null,
    });

    return await this.courseEnrollmentRepository.save(courseEnrollment);
  }

  async findAll(query: { 
    employee_id?: string; 
    employeeId?: string; 
    course_id?: string;
    courseId?: string;
    status?: string;
  }): Promise<CourseEnrollment[]> {
    const queryBuilder = this.courseEnrollmentRepository.createQueryBuilder('course_enrollment');

    // Filter by employee_id if provided
    const employeeId = query.employee_id || query.employeeId;
    if (employeeId) {
      queryBuilder.where('course_enrollment.employeeId = :employeeId', { employeeId });
    }

    // Filter by course_id if provided
    const courseId = query.course_id || query.courseId;
    if (courseId) {
      const whereCondition = employeeId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('course_enrollment.courseId = :courseId', { courseId });
    }

    // Filter by status if provided
    if (query.status) {
      const whereCondition = (employeeId || courseId) ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('course_enrollment.status = :status', { status: query.status });
    }

    queryBuilder.orderBy('course_enrollment.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<CourseEnrollment> {
    const courseEnrollment = await this.courseEnrollmentRepository.findOne({
      where: { id },
    });

    if (!courseEnrollment) {
      throw new NotFoundException(`Course enrollment with ID ${id} not found`);
    }

    return courseEnrollment;
  }

  async update(id: string, updateCourseEnrollmentDto: UpdateCourseEnrollmentDto): Promise<CourseEnrollment> {
    const courseEnrollment = await this.findOne(id);
    
    const updateData: any = { ...updateCourseEnrollmentDto };
    if (updateCourseEnrollmentDto.completionDate) {
      updateData.completionDate = new Date(updateCourseEnrollmentDto.completionDate);
    }

    Object.assign(courseEnrollment, updateData);
    return await this.courseEnrollmentRepository.save(courseEnrollment);
  }

  async remove(id: string): Promise<void> {
    const courseEnrollment = await this.findOne(id);
    await this.courseEnrollmentRepository.remove(courseEnrollment);
  }
}
