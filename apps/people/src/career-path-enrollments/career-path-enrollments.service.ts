import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareerPathEnrollment } from './entities/career-path-enrollment.entity';
import { CreateCareerPathEnrollmentDto } from './dto/create-career-path-enrollment.dto';
import { UpdateCareerPathEnrollmentDto } from './dto/update-career-path-enrollment.dto';

@Injectable()
export class CareerPathEnrollmentsService {
  constructor(
    @InjectRepository(CareerPathEnrollment)
    private readonly careerPathEnrollmentRepository: Repository<CareerPathEnrollment>,
  ) {}

  async create(createCareerPathEnrollmentDto: CreateCareerPathEnrollmentDto): Promise<CareerPathEnrollment> {
    const careerPathEnrollment = this.careerPathEnrollmentRepository.create({
      ...createCareerPathEnrollmentDto,
      enrollmentDate: new Date(createCareerPathEnrollmentDto.enrollmentDate),
    });

    return await this.careerPathEnrollmentRepository.save(careerPathEnrollment);
  }

  async findAll(query: { 
    employee_id?: string; 
    employeeId?: string; 
    career_path_id?: string;
    careerPathId?: string;
    status?: string;
  }): Promise<CareerPathEnrollment[]> {
    const queryBuilder = this.careerPathEnrollmentRepository.createQueryBuilder('career_path_enrollment');

    // Filter by employee_id if provided
    const employeeId = query.employee_id || query.employeeId;
    if (employeeId) {
      queryBuilder.where('career_path_enrollment.employeeId = :employeeId', { employeeId });
    }

    // Filter by career_path_id if provided
    const careerPathId = query.career_path_id || query.careerPathId;
    if (careerPathId) {
      const whereCondition = employeeId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('career_path_enrollment.careerPathId = :careerPathId', { careerPathId });
    }

    // Filter by status if provided
    if (query.status) {
      const whereCondition = (employeeId || careerPathId) ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('career_path_enrollment.status = :status', { status: query.status });
    }

    queryBuilder.orderBy('career_path_enrollment.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<CareerPathEnrollment> {
    const careerPathEnrollment = await this.careerPathEnrollmentRepository.findOne({
      where: { id },
    });

    if (!careerPathEnrollment) {
      throw new NotFoundException(`Career path enrollment with ID ${id} not found`);
    }

    return careerPathEnrollment;
  }

  async update(id: string, updateCareerPathEnrollmentDto: UpdateCareerPathEnrollmentDto): Promise<CareerPathEnrollment> {
    const careerPathEnrollment = await this.findOne(id);
    
    Object.assign(careerPathEnrollment, updateCareerPathEnrollmentDto);
    return await this.careerPathEnrollmentRepository.save(careerPathEnrollment);
  }

  async remove(id: string): Promise<void> {
    const careerPathEnrollment = await this.findOne(id);
    await this.careerPathEnrollmentRepository.remove(careerPathEnrollment);
  }
}
