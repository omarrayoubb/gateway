import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ActivateUserDto } from './dto/activate-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller()
export class UsersGrpcController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UserService', 'Register')
  async register(data: any) {
    try {
      const employeeId = data.employeeId || data.employee_id;
      if (!data.email || !data.role) {
        throw new RpcException({
          code: 3,
          message: 'email and role are required. employeeId is optional - if not provided, employee will be found by email.',
        });
      }

      const createDto: CreateUserDto = {
        email: data.email,
        employeeId: employeeId || undefined, // Make it optional
        role: data.role,
      };

      const user = await this.usersService.create(createDto, data.createdBy || 'system');
      return {
        userId: user.id,
        activationToken: user.activationToken,
        email: user.email,
      };
    } catch (error) {
      const code = error.status === 400 ? 3 : error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to register user',
      });
    }
  }

  @GrpcMethod('UserService', 'Activate')
  async activate(data: any) {
    try {
      const activateDto: ActivateUserDto = {
        activationToken: data.activationToken || data.activation_token,
        password: data.password,
      };

      const result = await this.usersService.activate(activateDto);
      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      };
    } catch (error) {
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to activate user',
      });
    }
  }

  @GrpcMethod('UserService', 'Login')
  async login(data: any) {
    try {
      const loginDto: LoginDto = {
        email: data.email,
        password: data.password,
      };

      const result = await this.usersService.login(loginDto, data.ipAddress, data.userAgent);
      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        user: result.user,
      };
    } catch (error) {
      const code = error.status === 401 ? 16 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to login',
      });
    }
  }

  @GrpcMethod('UserService', 'RefreshToken')
  async refreshToken(data: any) {
    try {
      const result = await this.usersService.refreshToken(data.refreshToken || data.refresh_token);
      return {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      };
    } catch (error) {
      throw new RpcException({
        code: 16,
        message: error.message || 'Invalid refresh token',
      });
    }
  }

  @GrpcMethod('UserService', 'ForgotPassword')
  async forgotPassword(data: any) {
    try {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: data.email,
      };

      const result = await this.usersService.forgotPassword(forgotPasswordDto);
      return result;
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to process forgot password request',
      });
    }
  }

  @GrpcMethod('UserService', 'ResetPassword')
  async resetPassword(data: any) {
    try {
      const resetPasswordDto: ResetPasswordDto = {
        resetToken: data.resetToken || data.reset_token,
        newPassword: data.newPassword || data.new_password,
      };

      const result = await this.usersService.resetPassword(resetPasswordDto);
      return result;
    } catch (error) {
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to reset password',
      });
    }
  }

  @GrpcMethod('UserService', 'GetMe')
  async getMe(data: any) {
    try {
      const user = await this.usersService.findOne(data.userId);
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
      const users = await this.usersService.findAll({
        role: data.role,
        status: data.status,
        departmentId: data.departmentId || data.department_id,
      });
      return {
        users: users.map(user => this.mapUserToProto(user)),
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
      const user = await this.usersService.findOne(data.id);
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
      const user = await this.usersService.update(data.id, {
        role: data.role,
        status: data.status,
      }, data.updatedBy || 'system');
      return this.mapUserToProto(user);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update user',
      });
    }
  }

  @GrpcMethod('UserService', 'BootstrapAdmin')
  async bootstrapAdmin(data: any) {
    try {
      if (!data.email || !data.password) {
        throw new RpcException({
          code: 3,
          message: 'email and password are required',
        });
      }

      const user = await this.usersService.bootstrapAdmin(
        data.email,
        data.password,
        data.name || 'System Administrator'
      );

      // Login the user to get tokens
      const loginResult = await this.usersService.login({
        email: data.email,
        password: data.password,
      });

      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        accessToken: loginResult.accessToken,
        refreshToken: loginResult.refreshToken,
        expiresIn: loginResult.expiresIn,
        user: loginResult.user,
        message: 'Admin account created successfully',
      };
    } catch (error) {
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to bootstrap admin account',
      });
    }
  }

  private mapUserToProto(user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      employeeId: user.employeeId || user.employee_id || '',
      employee: user.employee ? {
        id: user.employee.id,
        name: user.employee.name,
        departmentId: user.employee.departmentId || user.employee.department_id || '',
        managerId: user.employee.managerId || user.employee.manager_id || '',
      } : null,
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : '',
      createdAt: user.createdAt ? user.createdAt.toISOString() : '',
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : '',
    };
  }
}
