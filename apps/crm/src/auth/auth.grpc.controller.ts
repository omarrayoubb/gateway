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
    const registerDto: RegisterUserDto = {
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
    const result = await this.authService.register(registerDto);
    return {
      id: result.id,
      work_id: result.workId,
      name: result.name,
      email: result.email,
      work_location: result.workLocation,
      role_id: result.roleId,
      profile_id: result.profileId,
      created_at: result.createdAt?.toISOString() || '',
    };
  }

  @GrpcMethod('AuthService', 'Login')
  async login(data: any) {
    const loginDto: LoginDto = {
      email: data.email,
      password: data.password,
    };
    // First validate the user
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    // Then generate JWT token
    const result = await this.authService.login(user);
    return {
      access_token: result.accessToken,
      user_id: result.user.sub,
      email: result.user.email,
      name: user.name,
      role_id: result.user.roleId,
      profile_id: result.user.profileId,
    };
  }
}

