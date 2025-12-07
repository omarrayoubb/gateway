import { Controller } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { GrpcMethod } from '@nestjs/microservices';
import type { RegisterRequest, RegisterResponse } from '@app/common/types/auth';

@Controller()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @GrpcMethod('AuthService', 'Register')
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return await this.accountsService.register(data);
  }
}
