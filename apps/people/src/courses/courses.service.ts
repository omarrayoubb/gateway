import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create({
      ...createCourseDto,
      startDate: createCourseDto.startDate 
        ? new Date(createCourseDto.startDate) 
        : null,
      endDate: createCourseDto.endDate 
        ? new Date(createCourseDto.endDate) 
        : null,
    });

    return await this.courseRepository.save(course);
  }

  async findAll(query: { sort?: string }): Promise<Course[]> {
    const queryBuilder = this.courseRepository.createQueryBuilder('course');

    // Handle sorting
    if (query.sort) {
      const sortField = query.sort.startsWith('-') ? query.sort.substring(1) : query.sort;
      const order = query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap: Record<string, string> = {
        'created_at': 'createdAt',
        'start_date': 'startDate',
        'end_date': 'endDate',
      };
      const dbField = fieldMap[sortField] || sortField;
      queryBuilder.orderBy(`course.${dbField}`, order);
    } else {
      queryBuilder.orderBy('course.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    
    const updateData: any = { ...updateCourseDto };
    if (updateCourseDto.startDate) {
      updateData.startDate = new Date(updateCourseDto.startDate);
    }
    if (updateCourseDto.endDate) {
      updateData.endDate = new Date(updateCourseDto.endDate);
    }

    Object.assign(course, updateData);
    return await this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }
}
