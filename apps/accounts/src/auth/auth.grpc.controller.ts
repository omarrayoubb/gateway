import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'Register')
  async register(data: any) {
    try {
      // Proto uses camelCase, so access fields as camelCase
      const registerDto: RegisterUserDto = {
        workId: data.workId || data.work_id, // Support both formats
        name: data.name,
        email: data.email,
        workLocation: data.workLocation || data.work_location,
        roleId: data.roleId || data.role_id,
        password: data.password,
        timezone: data.timezone,
        department: data.department,
        deptManager: data.deptManager || data.dept_manager,
        birthday: data.birthday,
        profileId: data.profileId || data.profile_id,
      };
      const result = await this.authService.register(registerDto);
      
      // Return in proto format: RegisterResponse { status, error[], email }
      return {
        status: 200,
        error: [],
        email: result.email || '',
      };
    } catch (error) {
      // Handle all errors and return in proto format
      const errorMessage = error.message || 'Registration failed';
      let status = 500;
      
      // Map NestJS HTTP exceptions to status codes
      if (error.status) {
        status = error.status;
      } else if (error.name === 'ConflictException') {
        status = 409;
      } else if (error.name === 'BadRequestException') {
        status = 400;
      } else if (error.name === 'ValidationException') {
        status = 400;
      }
      
      return {
        status: status,
        error: [errorMessage],
        email: data.email || '',
      };
    }
  }

  @GrpcMethod('AuthService', 'Login')
  async login(data: any) {
    try {
      const loginDto: LoginDto = {
        email: data.email,
        password: data.password,
      };
      
      // First validate the user (checks email and password)
      const user = await this.authService.validateUser(loginDto.email, loginDto.password);
      
      // Then generate JWT token
      const result = await this.authService.login(user);
      
      // Map to proto format
      return {
        status: 200,
        error: [],
        accessToken: result.accessToken,
        userData: {
          sub: result.user.id,
          email: result.user.email || '',
          roleId: '', // Accounts doesn't manage roles
          roleName: '',
          profileId: '', // Accounts doesn't manage profiles
          profileName: '',
        },
      };
    } catch (error) {
      // Handle authentication errors
      return {
        status: 401,
        error: [error.message || 'Invalid email or password'],
        accessToken: '',
        userData: {
          sub: '',
          email: '',
          roleId: '',
          roleName: '',
          profileId: '',
          profileName: '',
        },
      };
    }
  }
}

