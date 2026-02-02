import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/person.entity';
import { CreateEmployeeDto } from './dto/create-person.dto';
import { UpdateEmployeeDto } from './dto/update-person.dto';
import { PaginationQueryDto } from './dto/pagination.dto';

export interface PaginatedEmployeesResult {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable()
export class PeopleService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    try {
      const existingEmployee = await this.employeeRepository.findOneBy({
        email: createEmployeeDto.email,
      });

      if (existingEmployee) {
        throw new ConflictException(`Employee with email ${createEmployeeDto.email} already exists`);
      }

      const employee = this.employeeRepository.create({
        ...createEmployeeDto,
        hireDate: createEmployeeDto.hireDate ? new Date(createEmployeeDto.hireDate) : null,
      });
      return await this.employeeRepository.save(employee);
    } catch (error) {
      console.error('Error in PeopleService.create:', error);
      throw error;
    }
  }

  async findAll(paginationQuery: PaginationQueryDto & { sort?: string }): Promise<PaginatedEmployeesResult> {
    const { page = 1, limit = 10, search, sort, status, department } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.employeeRepository.createQueryBuilder('employee');

    if (status) {
      queryBuilder.where('employee.status = :status', { status });
    }

    if (department) {
      const whereCondition = status ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('employee.department = :department', { department });
    }

    if (search) {
      const whereCondition = status || department ? 'andWhere' : 'where';
      queryBuilder[whereCondition](
        '(employee.name ILIKE :search OR employee.email ILIKE :search OR employee.phone ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Handle sorting
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      const order = sort.startsWith('-') ? 'DESC' : 'ASC';
      // Map common field names from snake_case to camelCase
      const fieldMap: Record<string, string> = {
        'created_at': 'createdAt',
        'updated_at': 'updatedAt',
        'hire_date': 'hireDate',
        'job_title': 'jobTitle',
        'department_id': 'departmentId',
        'manager_email': 'managerEmail',
        'emergency_contact_name': 'emergencyContactName',
        'emergency_contact_phone': 'emergencyContactPhone',
        'emergency_contact_relationship': 'emergencyContactRelationship',
      };
      const dbField = fieldMap[sortField] || sortField;
      // Validate field exists to prevent SQL injection
      const validFields = ['name', 'email', 'phone', 'position', 'department', 'status', 'createdAt', 'updatedAt', 'hireDate', 'jobTitle', 'departmentId', 'managerEmail', 'city', 'country'];
      if (validFields.includes(dbField) || Object.values(fieldMap).includes(dbField)) {
        queryBuilder.orderBy(`employee.${dbField}`, order);
      } else {
        queryBuilder.orderBy('employee.createdAt', 'DESC');
      }
    } else {
      queryBuilder.orderBy('employee.createdAt', 'DESC');
    }

    const [data, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
    };
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);

    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingEmployee = await this.employeeRepository.findOneBy({
        email: updateEmployeeDto.email,
      });

      if (existingEmployee) {
        throw new ConflictException(`Employee with email ${updateEmployeeDto.email} already exists`);
      }
    }

    if (updateEmployeeDto.hireDate) {
      (updateEmployeeDto as any).hireDate = new Date(updateEmployeeDto.hireDate);
    }

    // Only apply defined fields so partial updates (e.g. only manager_id) don't overwrite others with undefined
    const definedUpdates = Object.fromEntries(
      Object.entries(updateEmployeeDto).filter(([, v]) => v !== undefined)
    ) as Partial<UpdateEmployeeDto>;
    Object.assign(employee, definedUpdates);
    return await this.employeeRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeeRepository.remove(employee);
  }
}

