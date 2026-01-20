import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
//only for testing purposes
export class AuthController {
  constructor(private readonly authService: AuthService) {}
}
