import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PeopleService, EmployeeWithDetails } from './people.service';
import { CreateEmployeeDto } from './dto/create-person.dto';
import { UpdateEmployeeDto } from './dto/update-person.dto';
import { EmployeeStatus } from './entities/person.entity';

@Controller()
export class PeopleGrpcController {
  constructor(private readonly peopleService: PeopleService) {}

  @GrpcMethod('PeopleService', 'GetPerson')
  async getPerson(data: { id: string }) {
    try {
      const employee = await this.peopleService.findOne(data.id);
      const withDetails = await this.peopleService.getEmployeeWithDetails(employee);
      return this.mapEmployeeToProto(withDetails);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2, // NOT_FOUND : UNKNOWN
        message: error.message || 'Failed to get employee',
      });
    }
  }

  @GrpcMethod('PeopleService', 'GetPeople')
  async getPeople(data: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    sort?: string; 
    status?: string; 
    department?: string; 
  }) {
    try {
      const page = data.page || 1;
      const limit = data.limit || 10;
      const result = await this.peopleService.findAll({ 
        page, 
        limit, 
        search: data.search || '',
        sort: data.sort,
        status: data.status,
        department: data.department,
      });
      const people = await Promise.all(
        result.data.map((employee) =>
          this.peopleService.getEmployeeWithDetails(employee).then((withDetails) => this.mapEmployeeToProto(withDetails)),
        ),
      );
      return {
        people,
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      console.error('Error in GetPeople gRPC method:', error);
      throw new RpcException({
        code: 2, // UNKNOWN
        message: error.message || 'Failed to get employees',
      });
    }
  }

  @GrpcMethod('PeopleService', 'CreatePerson')
  async createPerson(data: any) {
    try {
      console.log('CreatePerson received data:', JSON.stringify(data, null, 2));
      
      const createDto: CreateEmployeeDto = {
        id: data.id || undefined,
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        position: data.position || undefined,
        department: data.department || undefined,
        departmentId: data.departmentId || undefined,
        jobTitle: data.jobTitle || undefined,
        hireDate: data.hireDate || undefined,
        status: data.status || EmployeeStatus.ACTIVE,
        managerId: data.managerId || data.manager_id || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        emergencyContactName: data.emergencyContactName || undefined,
        emergencyContactPhone: data.emergencyContactPhone || undefined,
        emergencyContactRelationship: data.emergencyContactRelationship || undefined,
        baseSalary: data.baseSalary ? parseFloat(data.baseSalary) : undefined,
      };
      
      console.log('CreatePerson DTO:', JSON.stringify(createDto, null, 2));
      
      const employee = await this.peopleService.create(createDto);
      const withDetails = await this.peopleService.getEmployeeWithDetails(employee);
      return this.mapEmployeeToProto(withDetails);
    } catch (error) {
      console.error('CreatePerson error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
        stack: error.stack,
        code: error.code,
        detail: error.detail,
      });
      
      const code = error.status === 409 ? 6 : error.status === 400 ? 3 : 2; // ALREADY_EXISTS : INVALID_ARGUMENT : UNKNOWN
      const errorMessage = error.message || error.detail || 'Failed to create employee';
      
      throw new RpcException({
        code,
        message: errorMessage,
      });
    }
  }

  @GrpcMethod('PeopleService', 'UpdatePerson')
  async updatePerson(data: any) {
    try {
      const updateDto: UpdateEmployeeDto = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        department: data.department,
        departmentId: data.departmentId,
        jobTitle: data.jobTitle,
        hireDate: data.hireDate,
        status: data.status,
        managerId: data.managerId || data.manager_id || undefined,
        address: data.address,
        city: data.city,
        country: data.country,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        emergencyContactRelationship: data.emergencyContactRelationship,
        baseSalary: data.baseSalary ? parseFloat(data.baseSalary) : undefined,
      };
      const employee = await this.peopleService.update(data.id, updateDto);
      const withDetails = await this.peopleService.getEmployeeWithDetails(employee);
      return this.mapEmployeeToProto(withDetails);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update employee',
      });
    }
  }

  @GrpcMethod('PeopleService', 'DeletePerson')
  async deletePerson(data: { id: string }) {
    try {
      await this.peopleService.remove(data.id);
      return { success: true, message: 'Employee deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2; // NOT_FOUND : UNKNOWN
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete employee',
      });
    }
  }

  private mapEmployeeToProto(employee: EmployeeWithDetails | any) {
    const departmentRef = employee.department
      ? { id: employee.department.id, name: employee.department.name }
      : undefined;
    const managerRef = employee.manager
      ? { id: employee.manager.id, name: employee.manager.name, email: employee.manager.email }
      : undefined;
    return {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      position: employee.position || '',
      department: employee.department || '',
      departmentId: employee.departmentId || '',
      jobTitle: employee.jobTitle || '',
      hireDate: employee.hireDate
        ? (employee.hireDate instanceof Date ? employee.hireDate.toISOString() : String(employee.hireDate)).split('T')[0]
        : '',
      status: employee.status,
      managerId: employee.managerId || '',
      address: employee.address || '',
      city: employee.city || '',
      country: employee.country || '',
      emergencyContactName: employee.emergencyContactName || '',
      emergencyContactPhone: employee.emergencyContactPhone || '',
      emergencyContactRelationship: employee.emergencyContactRelationship || '',
      baseSalary: employee.baseSalary ? employee.baseSalary.toString() : '',
      createdAt: employee.createdAt
        ? (employee.createdAt instanceof Date ? employee.createdAt.toISOString() : String(employee.createdAt))
        : '',
      updatedAt: employee.updatedAt
        ? (employee.updatedAt instanceof Date ? employee.updatedAt.toISOString() : String(employee.updatedAt))
        : '',
      departmentRef: departmentRef ?? null,
      managerRef: managerRef ?? null,
    };
  }
}

