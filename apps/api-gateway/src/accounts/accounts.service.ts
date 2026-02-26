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
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

interface AuthService {
  register(data: RegisterRequest): Observable<RegisterResponse>;
  login(data: LoginRequest): Observable<LoginResponse>;
  validate(data: ValidateRequest): Observable<ValidateResponse>;
  getProfile(data: GetProfileRequest): Observable<GetProfileResponse>;
  updateProfile(data: UpdateProfileRequest): Observable<UpdateProfileResponse>;
  getUsers(data: GetUsersRequest): Observable<GetUsersResponse>;
  deleteUser(data: DeleteUserRequest): Observable<DeleteUserResponse>;
}

export interface DepartmentResponse {
  id: string;
  deptName: string;
  deptManagerId: string;
}

interface DepartmentService {
  GetDepartment(data: { id: string }): Observable<DepartmentResponse | null>;
  GetDepartments(data: Record<string, never>): Observable<{ departments: DepartmentResponse[] }>;
  CreateDepartment(data: { deptName?: string; deptManagerId?: string }): Observable<DepartmentResponse>;
  UpdateDepartment(data: { id: string; deptName?: string; deptManagerId?: string }): Observable<DepartmentResponse | null>;
  DeleteDepartment(data: { id: string }): Observable<{ success: boolean; message: string }>;
}

@Injectable()
export class AccountsService implements OnModuleInit {
  private authService: AuthService;
  private departmentService: DepartmentService;

  constructor(@Inject('AUTH_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
    this.departmentService = this.client.getService<DepartmentService>('DepartmentService');
  }

  register(body: RegisterRequest): Observable<RegisterResponse> {
    return this.authService.register(body);
  }

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.authService.login(body);
  }

  validate(body: ValidateRequest): Observable<ValidateResponse> {
    return this.authService.validate(body);
  }

  getProfile(token: string): Observable<GetProfileResponse> {
    // First validate the token
    return this.authService.validate({ token }).pipe(
      switchMap((validateResponse) => {
        if (!validateResponse.valid || !validateResponse.user) {
          return of({
            status: 401,
            error: ['Invalid or expired token'],
            profile: null,
          });
        }
        // If valid, fetch the profile using the user ID from the token
        return this.authService.getProfile({ userId: validateResponse.user.id });
      }),
      catchError(() =>
        of({
          status: 401,
          error: ['Authentication failed'],
          profile: null,
        }),
      ),
    );
  }

  updateProfile(token: string, updateData: Partial<UpdateProfileRequest>): Observable<UpdateProfileResponse> {
    // First validate the token
    return this.authService.validate({ token }).pipe(
      switchMap((validateResponse) => {
        if (!validateResponse.valid || !validateResponse.user) {
          return of({
            status: 401,
            error: ['Invalid or expired token'],
            profile: null,
          });
        }
        // If valid, update the profile with the user ID from the token
        return this.authService.updateProfile({
          userId: validateResponse.user.id,
          ...updateData,
        });
      }),
      catchError(() =>
        of({
          status: 401,
          error: ['Authentication failed'],
          profile: null,
        }),
      ),
    );
  }

  getUsers(): Observable<GetUsersResponse> {
    return this.authService.getUsers({});
  }

  deleteUser(userId: string): Observable<DeleteUserResponse> {
    return this.authService.deleteUser({ userId });
  }

  getDepartment(id: string): Observable<DepartmentResponse | null> {
    return this.departmentService.GetDepartment({ id });
  }

  getDepartments(): Observable<{ departments: DepartmentResponse[] }> {
    return this.departmentService.GetDepartments({});
  }

  createDepartment(data: { deptName?: string; deptManagerId?: string }): Observable<DepartmentResponse> {
    return this.departmentService.CreateDepartment(data);
  }

  updateDepartment(id: string, data: { deptName?: string; deptManagerId?: string }): Observable<DepartmentResponse | null> {
    return this.departmentService.UpdateDepartment({ id, ...data });
  }

  deleteDepartment(id: string): Observable<{ success: boolean; message: string }> {
    return this.departmentService.DeleteDepartment({ id });
  }
}