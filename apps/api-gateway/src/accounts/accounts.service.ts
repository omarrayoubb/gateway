import type { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse } from '@app/common/types/auth';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';

interface AuthService {
  register(data: RegisterRequest): Observable<RegisterResponse>;
  login(data: LoginRequest): Observable<LoginResponse>;
}

@Injectable()
export class AccountsService implements OnModuleInit {
  private authService: AuthService;

  constructor(@Inject('AUTH_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  async register(body: RegisterRequest): Promise<RegisterResponse> {
    return await firstValueFrom(this.authService.register(body));
  }

  async login(body: LoginRequest): Promise<LoginResponse> {
    return await firstValueFrom(this.authService.login(body));
  }
}
