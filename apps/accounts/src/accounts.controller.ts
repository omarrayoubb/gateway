import { Controller } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ValidateRequest,
  ValidateResponse,
  GetProfileRequest,
  GetProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  GetUsersRequest,
  GetUsersResponse,
} from '@app/common/types/auth';

@Controller()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) { }

  @GrpcMethod('AuthService', 'Register')
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return await this.accountsService.register(data);
  }

  @GrpcMethod('AuthService', 'Login')
  async login(data: LoginRequest): Promise<LoginResponse> {
    return await this.accountsService.login(data);
  }

  @GrpcMethod('AuthService', 'Validate')
  async validate(data: ValidateRequest): Promise<ValidateResponse> {
    return await this.accountsService.validate(data);
  }

  @GrpcMethod('AuthService', 'GetProfile')
  async getProfile(data: GetProfileRequest): Promise<GetProfileResponse> {
    return await this.accountsService.getProfile(data);
  }

  @GrpcMethod('AuthService', 'UpdateProfile')
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    return await this.accountsService.updateProfile(data);
  }
}
