import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentStatus } from './entities/department.entity';

@Controller()
export class DepartmentsGrpcController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @GrpcMethod('DepartmentsService', 'GetDepartment')
  async getDepartment(data: { id: string }) {
    try {
      const department = await this.departmentsService.findOne(data.id);
      return this.mapDepartmentToProto(department);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2, // NOT_FOUND : UNKNOWN
        message: error.message || 'Failed to get department',
      });
    }
  }

  @GrpcMethod('DepartmentsService', 'GetDepartments')
  async getDepartments() {
    try {
      const departments = await this.departmentsService.findAll();
      return {
        departments: departments.map(dept => this.mapDepartmentToProto(dept)),
      };
    } catch (error) {
      console.error('Error in GetDepartments gRPC method:', error);
      throw new RpcException({
        code: 2, // UNKNOWN
        message: error.message || 'Failed to get departments',
      });
    }
  }

  @GrpcMethod('DepartmentsService', 'CreateDepartment')
  async createDepartment(data: any) {
    try {
      console.log('CreateDepartment received data:', JSON.stringify(data, null, 2));
      
      const createDto: CreateDepartmentDto = {
        name: data.name,
        code: data.code,
        description: data.description || undefined,
        managerEmail: data.managerEmail || undefined,
        parentDepartmentId: data.parentDepartmentId || undefined,
        status: data.status || DepartmentStatus.ACTIVE,
      };
      
      console.log('CreateDepartment DTO:', JSON.stringify(createDto, null, 2));
      
      const department = await this.departmentsService.create(createDto);
      return this.mapDepartmentToProto(department);
    } catch (error) {
      console.error('CreateDepartment error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
        stack: error.stack,
        code: error.code,
        detail: error.detail,
      });
      
      const code = error.status === 409 ? 6 : error.status === 400 ? 3 : 2; // ALREADY_EXISTS : INVALID_ARGUMENT : UNKNOWN
      const errorMessage = error.message || error.detail || 'Failed to create department';
      
      throw new RpcException({
        code,
        message: errorMessage,
      });
    }
  }

  @GrpcMethod('DepartmentsService', 'UpdateDepartment')
  async updateDepartment(data: any) {
    try {
      const updateDto: UpdateDepartmentDto = {
        name: data.name,
        code: data.code,
        description: data.description,
        managerEmail: data.managerEmail,
        parentDepartmentId: data.parentDepartmentId,
        status: data.status,
      };
      const department = await this.departmentsService.update(data.id, updateDto);
      return this.mapDepartmentToProto(department);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update department',
      });
    }
  }

  @GrpcMethod('DepartmentsService', 'DeleteDepartment')
  async deleteDepartment(data: { id: string }) {
    try {
      await this.departmentsService.remove(data.id);
      return { success: true, message: 'Department deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : 2; // NOT_FOUND : ALREADY_EXISTS : UNKNOWN
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete department',
      });
    }
  }

  private mapDepartmentToProto(department: any) {
    return {
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description || '',
      managerEmail: department.managerEmail || '',
      parentDepartmentId: department.parentDepartmentId || '',
      status: department.status,
      createdAt: department.createdAt?.toISOString() || '',
      updatedAt: department.updatedAt?.toISOString() || '',
    };
  }
}

