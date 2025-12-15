import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/users.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // This tells Passport to look for 'email' in the body
      // instead of the default 'username'
      usernameField: 'email',
    });
  }

  /**
   * This method is automatically called by Passport when the LocalAuthGuard is used.
   * It receives the email and password from the request body.
   */
  async validate(email: string, password: string): Promise<Omit<User, 'password'>> {
    console.log(`Validating user: ${email}`);
    
    // We use our AuthService to validate the user
    const user = await this.authService.validateUser(email, password);
    
    if (!user) {
      // This will result in a 401 Unauthorized response
      throw new UnauthorizedException();
    }
    
    // Passport will attach this user object to the Request object as `req.user`
    return user;
  }
}