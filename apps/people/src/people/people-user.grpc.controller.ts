import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PeopleService } from './people.service';
import { PeopleUserRole } from './entities/people-user.entity';

@Controller()
export class PeopleUserGrpcController {
  constructor(private readonly peopleService: PeopleService) {}

  @GrpcMethod('UserService', 'GetMe')
  async getMe(data: any) {
    try {
      const userId = data.userId;
      if (!userId) {
        throw new RpcException({ code: 3, message: 'userId is required' });
      }
      const user = await this.peopleService.findOneUser(userId);
      return this.mapUserToProto(user);
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to get user',
      });
    }
  }

  @GrpcMethod('UserService', 'GetUsers')
  async getUsers(data: any) {
    try {
      const users = await this.peopleService.findAllUsers({
        role: data.role,
        status: data.status,
        departmentId: data.departmentId || data.department_id,
      });
      return {
        users: users.map((user) => this.mapUserToProto(user)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get users',
      });
    }
  }

  @GrpcMethod('UserService', 'GetUser')
  async getUser(data: any) {
    try {
      const id = data.id;
      if (!id) {
        throw new RpcException({ code: 3, message: 'id is required' });
      }
      const user = await this.peopleService.findOneUser(id);
      return this.mapUserToProto(user);
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to get user',
      });
    }
  }

  @GrpcMethod('UserService', 'UpdateUser')
  async updateUser(data: any) {
    try {
      const id = data.id;
      if (!id) {
        throw new RpcException({ code: 3, message: 'id is required' });
      }
      const role = data.role != null ? this.parseRole(data.role) : undefined;
      const user = await this.peopleService.updateUserRole(id, { role }, data.updatedBy || 'system');
      return this.mapUserToProto(user);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update user',
      });
    }
  }

  private parseRole(role: string): PeopleUserRole {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return PeopleUserRole.ADMIN;
    if (r === 'hr') return PeopleUserRole.HR;
    if (r === 'manager') return PeopleUserRole.MANAGER;
    return PeopleUserRole.EMPLOYEE;
  }

  private mapUserToProto(user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      employeeId: user.employeeId || '',
      employee: user.employee
        ? {
            id: user.employee.id,
            name: user.employee.name,
            departmentId: user.employee.departmentId ?? '',
            managerId: user.employee.managerId ?? '',
          }
        : null,
      lastLogin: user.lastLogin ? String(user.lastLogin) : '',
      createdAt: user.createdAt ? (user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt) : '',
      updatedAt: user.updatedAt ? (user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt) : '',
    };
  }
}
