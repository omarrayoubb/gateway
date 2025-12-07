import { Controller, Post, Body } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import type { RegisterRequest, RegisterResponse } from '@app/common/types/auth';
import { Observable } from 'rxjs';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('register')
  register(@Body() body: RegisterRequest): Observable<RegisterResponse> {
    return this.accountsService.register(body);
  }
}
