import { Controller, Post, Body } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import type { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse } from '@app/common/types/auth';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('register')
  async register(@Body() body: RegisterRequest): Promise<RegisterResponse> {
    return await this.accountsService.register(body);
  }

  @Post('login')
  async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    return await this.accountsService.login(body);
  }
}
