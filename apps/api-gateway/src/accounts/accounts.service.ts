import type { RegisterRequest, RegisterResponse } from '@app/common/types/auth';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface AuthService {
  register(data: RegisterRequest): Observable<RegisterResponse>;
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
}
