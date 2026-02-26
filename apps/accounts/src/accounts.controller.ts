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
  DeleteUserRequest,
  DeleteUserResponse,
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
  async updateProfile(data: UpdateProfileRequest & { department_id?: string | null }): Promise<UpdateProfileResponse> {
    // Normalize proto snake_case to camelCase so service receives consistent shape
    const normalized: UpdateProfileRequest = {
      userId: data.userId,
      workId: data.workId,
      name: data.name,
      email: data.email,
      workLocation: data.workLocation,
      role: data.role,
      timezone: data.timezone,
      departmentId: data.departmentId ?? data.department_id ?? undefined,
      birthday: data.birthday,
      password: data.password,
      status: data.status,
      position: data.position,
      hireDate: data.hireDate,
      managerId: data.managerId,
      hierarchyLevel: data.hierarchyLevel,
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      emergencyContactRelationship: data.emergencyContactRelationship,
      baseSalary: data.baseSalary,
    };
    return await this.accountsService.updateProfile(normalized);
  }

  @GrpcMethod('AuthService', 'DeleteUser')
  async deleteUser(data: DeleteUserRequest): Promise<DeleteUserResponse> {
    const result = await this.accountsService.deleteUser(data.userId);
    return { success: result.success, error: result.error };
  }

  @GrpcMethod('DepartmentService', 'GetDepartment')
  async getDepartment(data: { id: string }) {
    return await this.accountsService.getDepartment(data);
  }

  @GrpcMethod('DepartmentService', 'GetDepartments')
  async getDepartments() {
    return await this.accountsService.getDepartments();
  }

  @GrpcMethod('DepartmentService', 'CreateDepartment')
  async createDepartment(data: { deptName?: string; deptManagerId?: string }) {
    return await this.accountsService.createDepartment(data);
  }

  @GrpcMethod('DepartmentService', 'UpdateDepartment')
  async updateDepartment(data: { id: string; deptName?: string; deptManagerId?: string }) {
    return await this.accountsService.updateDepartment(data);
  }

  @GrpcMethod('DepartmentService', 'DeleteDepartment')
  async deleteDepartment(data: { id: string }) {
    return await this.accountsService.deleteDepartment(data);
  }
}
