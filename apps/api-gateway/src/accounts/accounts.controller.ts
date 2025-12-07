import { Controller, Post, Body, Get, Headers, Patch } from '@nestjs/common';
import { AccountsService } from './accounts.service';
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
    // Extract token from Authorization header (Bearer token)
    const token = authorization?.replace('Bearer ', '');
    return this.accountsService.getProfile(token);
  }

  @Patch('profile')
  updateProfile(
    @Headers('authorization') authorization: string,
    @Body() body: Partial<UpdateProfileRequest>,
  ): Observable<UpdateProfileResponse> {
    // Extract token from Authorization header (Bearer token)
    const token = authorization?.replace('Bearer ', '');
    return this.accountsService.updateProfile(token, body);
  }
}
