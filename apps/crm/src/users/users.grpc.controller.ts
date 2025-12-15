import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { RegisterUserDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from '../auth/dto/update.dto';

@Controller()
export class UsersGrpcController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UsersService', 'GetUser')
  async getUser(data: { id: string }) {
    const user = await this.usersService.findOne(data.id);
    return this.mapUserToProto(user);
  }

  @GrpcMethod('UsersService', 'GetUsers')
  async getUsers(data: { page?: number; limit?: number; search?: string }) {
    const users = await this.usersService.findAll();
    return {
      users: users.map(user => this.mapUserToProto(user)),
      total: users.length,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  }

  @GrpcMethod('UsersService', 'CreateUser')
  async createUser(data: any) {
    const createDto: RegisterUserDto = {
      workId: data.work_id,
      name: data.name,
      email: data.email,
      workLocation: data.work_location,
      roleId: data.role_id,
      password: data.password,
      timezone: data.timezone,
      department: data.department,
      deptManager: data.dept_manager,
      birthday: data.birthday,
      profileId: data.profile_id,
    };
    const user = await this.usersService.create(createDto);
    return this.mapUserToProto(user);
  }

  @GrpcMethod('UsersService', 'UpdateUser')
  async updateUser(data: any) {
    const updateDto: UpdateUserDto = {
      workId: data.work_id,
      name: data.name,
      email: data.email,
      workLocation: data.work_location,
      roleId: data.role_id,
      password: data.password,
      timezone: data.timezone,
      department: data.department,
      deptManager: data.dept_manager,
      birthday: data.birthday,
      profileId: data.profile_id,
    };
    const user = await this.usersService.update(data.id, updateDto);
    return this.mapUserToProto(user);
  }

  @GrpcMethod('UsersService', 'DeleteUser')
  async deleteUser(data: { id: string }) {
    await this.usersService.remove(data.id);
    return { success: true, message: 'User deleted successfully' };
  }

  private mapUserToProto(user: any) {
    return {
      id: user.id,
      work_id: user.workId || '',
      name: user.name || '',
      email: user.email || '',
      work_location: user.workLocation || '',
      role_id: user.roleId || '',
      profile_id: user.profileId || '',
      created_at: user.createdAt?.toISOString() || '',
      updated_at: user.updatedAt?.toISOString() || '',
    };
  }
}

