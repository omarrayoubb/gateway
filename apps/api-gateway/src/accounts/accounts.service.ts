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
}

@Injectable()
export class AccountsService implements OnModuleInit {
  private authService: AuthService;

  constructor(@Inject('AUTH_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
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
}
