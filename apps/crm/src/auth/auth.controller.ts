import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local.authguard';
import { RegisterUserDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';


@Controller('auth') // Base route is /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Handles the POST /auth/login endpoint.
   * @UseGuards(LocalAuthGuard) automatically triggers the LocalStrategy.
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any): Promise<LoginResponseDto> {
    // @UseGuards has already run the LocalStrategy and validated the user.
    // The user object is now attached to req.user.
    // We just need to call our login service to generate the JWT.
    return this.authService.login(req.user);
  }

  /**
   * Handles the POST /auth/register endpoint.
   */
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto): Promise<RegisterResponseDto> {
    // The ValidationPipe (in main.ts) automatically checks the DTO
    // and will send a 400 Bad Request if validation fails.
    return this.authService.register(registerUserDto);
  }
}