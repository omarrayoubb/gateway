import { Controller, Post, Body, Get, Headers, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { AccountsService, DepartmentResponse } from './accounts.service';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ValidateRequest,
  ValidateResponse,
  GetProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  GetUsersResponse,
  DeleteUserResponse,
} from '@app/common/types/auth';
import { Observable } from 'rxjs';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('register')
  register(@Body() body: RegisterRequest): Observable<RegisterResponse> {
    return this.accountsService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginRequest): Observable<LoginResponse> {
    return this.accountsService.login(body);
  }

  @Post('validate')
  validate(@Body() body: ValidateRequest): Observable<ValidateResponse> {
    return this.accountsService.validate(body);
  }

  @Get('profile')
  getProfile(@Headers('authorization') authorization: string): Observable<GetProfileResponse> {
    const token = authorization?.replace('Bearer ', '');
    return this.accountsService.getProfile(token);
  }

  @Patch('profile')
  updateProfile(
    @Headers('authorization') authorization: string,
    @Body() body: Partial<UpdateProfileRequest>,
  ): Observable<UpdateProfileResponse> {
    const token = authorization?.replace('Bearer ', '');
    return this.accountsService.updateProfile(token, body);
  }

  @Get('users')
  getUsers(): Observable<GetUsersResponse> {
    return this.accountsService.getUsers();
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  deleteUser(@Param('id') id: string): Observable<DeleteUserResponse> {
    return this.accountsService.deleteUser(id);
  }

  // Account departments CRUD
  @Get('departments')
  getDepartments(): Observable<{ departments: DepartmentResponse[] }> {
    return this.accountsService.getDepartments();
  }

  @Get('departments/:id')
  getDepartment(@Param('id') id: string): Observable<DepartmentResponse | null> {
    return this.accountsService.getDepartment(id);
  }

  @Post('departments')
  @HttpCode(HttpStatus.CREATED)
  createDepartment(
    @Body() body: { deptName?: string; deptManagerId?: string },
  ): Observable<DepartmentResponse> {
    return this.accountsService.createDepartment(body);
  }

  @Patch('departments/:id')
  updateDepartment(
    @Param('id') id: string,
    @Body() body: { deptName?: string; deptManagerId?: string },
  ): Observable<DepartmentResponse | null> {
    return this.accountsService.updateDepartment(id, body);
  }

  @Delete('departments/:id')
  @HttpCode(HttpStatus.OK)
  deleteDepartment(@Param('id') id: string): Observable<{ success: boolean; message: string }> {
    return this.accountsService.deleteDepartment(id);
  }
}
