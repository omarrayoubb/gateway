import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeCertification } from './entities/employee-certification.entity';
import { CreateEmployeeCertificationDto } from './dto/create-employee-certification.dto';

@Injectable()
export class EmployeeCertificationsService {
  constructor(
    @InjectRepository(EmployeeCertification)
    private readonly employeeCertificationRepository: Repository<EmployeeCertification>,
  ) {}

  async findAll(query: { 
    employee_id?: string; 
    employeeId?: string; 
    certification_id?: string;
    certificationId?: string;
    status?: string;
  }): Promise<EmployeeCertification[]> {
    const queryBuilder = this.employeeCertificationRepository.createQueryBuilder('employee_certification');

    // Filter by employee_id if provided
    const employeeId = query.employee_id || query.employeeId;
    if (employeeId) {
      queryBuilder.where('employee_certification.employeeId = :employeeId', { employeeId });
    }

    // Filter by certification_id if provided
    const certificationId = query.certification_id || query.certificationId;
    if (certificationId) {
      const whereCondition = employeeId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('employee_certification.certificationId = :certificationId', { certificationId });
    }

    // Filter by status if provided
    if (query.status) {
      const whereCondition = (employeeId || certificationId) ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('employee_certification.status = :status', { status: query.status });
    }

    queryBuilder.orderBy('employee_certification.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async create(createEmployeeCertificationDto: CreateEmployeeCertificationDto): Promise<EmployeeCertification> {
    const employeeCertification = this.employeeCertificationRepository.create({
      ...createEmployeeCertificationDto,
      issueDate: new Date(createEmployeeCertificationDto.issueDate),
      expiryDate: createEmployeeCertificationDto.expiryDate 
        ? new Date(createEmployeeCertificationDto.expiryDate) 
        : null,
    });

    return await this.employeeCertificationRepository.save(employeeCertification);
  }
}
