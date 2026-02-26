import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { UserCreatedEvent } from '@app/common/events/user-created.event';
import type { UserUpdatedEvent } from '@app/common/events/user-updated.event';
import { UserDeletedEvent } from '@app/common/events/user-deleted.event';
import { Employee, EmployeeStatus } from './entities/person.entity';
import { PeopleUser, PeopleUserRole } from './entities/people-user.entity';
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

/** Composite view for gRPC: PeopleUser + Employee by id (same as Accounts user id) */
export interface PeopleUserView {
  id: string;
  email: string;
  role: string;
  status: string;
  employeeId: string | null;
  employee: { id: string; name: string; departmentId: string | null; managerId: string | null } | null;
  lastLogin: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Employee with department and manager objects for response (department from employee fields; manager from employees table) */
export type EmployeeWithDetails = Omit<Employee, 'department'> & {
  department: { id: string; name: string } | null;
  manager: { id: string; name: string; email: string } | null;
};

@Injectable()
export class PeopleService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(PeopleUser)
    private readonly peopleUserRepository: Repository<PeopleUser>,
  ) {}

  /**
   * Called when Accounts publishes user.created. Creates people_users row and Employee from full event payload.
   */
  async createFromEvent(event: UserCreatedEvent): Promise<void> {
    const existing = await this.peopleUserRepository.findOne({ where: { id: event.id } });
    if (existing) return;

    const employeeById = await this.employeeRepository.findOne({ where: { id: event.id } });
    if (employeeById) return;

    const role = this.mapRoleToPeopleUserRole(event.role);

    const employee = this.employeeRepository.create({
      id: event.id,
      name: event.name,
      email: event.email ?? '',
      position: event.position ?? null,
      department: event.department ?? event.departmentName ?? null,
      departmentId: event.departmentId ?? null,
      hireDate: event.hireDate ? new Date(event.hireDate) : null,
      managerId: event.managerId ?? null,
      hierarchyLevel: event.hierarchyLevel ?? null,
      phone: event.phone ?? null,
      address: event.address ?? null,
      city: event.city ?? null,
      country: event.country ?? null,
      emergencyContactName: event.emergencyContactName ?? null,
      emergencyContactPhone: event.emergencyContactPhone ?? null,
      emergencyContactRelationship: event.emergencyContactRelationship ?? null,
      baseSalary: event.baseSalary != null ? Number(event.baseSalary) : null,
      status: EmployeeStatus.ACTIVE,
    });
    await this.employeeRepository.save(employee);

    const peopleUser = this.peopleUserRepository.create({ id: event.id, role });
    await this.peopleUserRepository.save(peopleUser);
  }

  /**
   * Called when Accounts publishes user.updated. Updates Employee (and PeopleUser role) by id.
   */
  async updateFromEvent(event: UserUpdatedEvent): Promise<void> {
    const employee = await this.employeeRepository.findOne({ where: { id: event.id } });
    if (!employee) return;

    employee.name = event.name;
    employee.email = event.email ?? employee.email;
    employee.position = event.position ?? null;
    employee.department = event.department ?? event.departmentName ?? null;
    employee.departmentId = event.departmentId ?? null;
    employee.hireDate = event.hireDate ? new Date(event.hireDate) : null;
    employee.managerId = event.managerId ?? null;
    employee.hierarchyLevel = event.hierarchyLevel ?? null;
    employee.phone = event.phone ?? null;
    employee.address = event.address ?? null;
    employee.city = event.city ?? null;
    employee.country = event.country ?? null;
    employee.emergencyContactName = event.emergencyContactName ?? null;
    employee.emergencyContactPhone = event.emergencyContactPhone ?? null;
    employee.emergencyContactRelationship = event.emergencyContactRelationship ?? null;
    employee.baseSalary = event.baseSalary != null ? Number(event.baseSalary) : null;
    await this.employeeRepository.save(employee);

    const peopleUser = await this.peopleUserRepository.findOne({ where: { id: event.id } });
    if (peopleUser) {
      peopleUser.role = this.mapRoleToPeopleUserRole(event.role);
      await this.peopleUserRepository.save(peopleUser);
    }
  }

  /**
   * Called when Accounts publishes user.deleted. Soft-deletes the Employee (status = INACTIVE).
   */
  async deleteFromEvent(event: UserDeletedEvent): Promise<void> {
    const employee = await this.employeeRepository.findOne({ where: { id: event.id } });
    if (!employee) return;
    employee.status = EmployeeStatus.INACTIVE;
    await this.employeeRepository.save(employee);
  }

  private mapRoleToPeopleUserRole(role: string): PeopleUserRole {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return PeopleUserRole.ADMIN;
    if (r === 'hr') return PeopleUserRole.HR;
    if (r === 'manager') return PeopleUserRole.MANAGER;
    return PeopleUserRole.EMPLOYEE;
  }

  async findOneUser(id: string): Promise<PeopleUserView> {
    const peopleUser = await this.peopleUserRepository.findOne({ where: { id } });
    if (!peopleUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const employee = await this.employeeRepository.findOne({ where: { id } });
    return this.toUserView(peopleUser, employee);
  }

  async findAllUsers(query: { role?: string; status?: string; departmentId?: string }): Promise<PeopleUserView[]> {
    const qb = this.peopleUserRepository.createQueryBuilder('pu');
    if (query.role) {
      qb.andWhere('pu.role = :role', { role: query.role });
    }
    const peopleUsers = await qb.getMany();
    const views: PeopleUserView[] = [];
    for (const pu of peopleUsers) {
      const employee = await this.employeeRepository.findOne({ where: { id: pu.id } });
      if (query.status && employee?.status !== query.status) continue;
      if (query.departmentId && (employee?.departmentId ?? null) !== query.departmentId) continue;
      views.push(this.toUserView(pu, employee));
    }
    return views;
  }

  async updateUserRole(id: string, updateData: { role?: PeopleUserRole }, _updatedBy: string): Promise<PeopleUserView> {
    const peopleUser = await this.peopleUserRepository.findOne({ where: { id } });
    if (!peopleUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (updateData.role !== undefined) {
      peopleUser.role = updateData.role;
      await this.peopleUserRepository.save(peopleUser);
    }
    const employee = await this.employeeRepository.findOne({ where: { id } });
    return this.toUserView(peopleUser, employee);
  }

  private toUserView(pu: PeopleUser, employee: Employee | null): PeopleUserView {
    return {
      id: pu.id,
      email: employee?.email ?? '',
      role: pu.role,
      status: employee?.status ?? 'active',
      employeeId: employee?.id ?? null,
      employee: employee
        ? {
            id: employee.id,
            name: employee.name,
            departmentId: employee.departmentId ?? null,
            managerId: employee.managerId ?? null,
          }
        : null,
      lastLogin: null,
      createdAt: pu.createdAt,
      updatedAt: pu.updatedAt,
    };
  }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    try {
      const id = createEmployeeDto.id ?? randomUUID();
      if (createEmployeeDto.id) {
        const existingById = await this.employeeRepository.findOneBy({ id: createEmployeeDto.id });
        if (existingById) {
          throw new ConflictException(`Employee with ID ${createEmployeeDto.id} already exists`);
        }
      }
      const existingEmployee = await this.employeeRepository.findOneBy({
        email: createEmployeeDto.email,
      });
      if (existingEmployee) {
        throw new ConflictException(`Employee with email ${createEmployeeDto.email} already exists`);
      }

      const employee = this.employeeRepository.create({
        ...createEmployeeDto,
        id,
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
        'manager_id': 'managerId',
        'emergency_contact_name': 'emergencyContactName',
        'emergency_contact_phone': 'emergencyContactPhone',
        'emergency_contact_relationship': 'emergencyContactRelationship',
      };
      const dbField = fieldMap[sortField] || sortField;
      // Validate field exists to prevent SQL injection
      const validFields = ['name', 'email', 'phone', 'position', 'department', 'status', 'createdAt', 'updatedAt', 'hireDate', 'jobTitle', 'departmentId', 'managerId', 'city', 'country'];
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

  /**
   * Enrich employee with department object (from employee's own fields) and manager object (from employees table by managerId).
   */
  async getEmployeeWithDetails(employee: Employee): Promise<EmployeeWithDetails> {
    const department: { id: string; name: string } | null =
      employee.departmentId != null
        ? { id: employee.departmentId, name: employee.department ?? '' }
        : null;

    let manager: { id: string; name: string; email: string } | null = null;
    if (employee.managerId) {
      const managerRow = await this.employeeRepository.findOne({
        where: { id: employee.managerId },
      });
      if (managerRow) {
        manager = {
          id: managerRow.id,
          name: managerRow.name,
          email: managerRow.email ?? '',
        };
      }
    }

    return {
      ...employee,
      department,
      manager,
    };
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

