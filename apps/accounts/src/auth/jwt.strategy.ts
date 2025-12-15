import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UsersService,
  ) {
    super({
      // 1. Tell Passport to extract the JWT from the 'Authorization' header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. We will not allow an expired token
      ignoreExpiration: false,
      // 3. Use our secret from the .env file to validate the token's signature
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  /**
   * This is called AFTER the JWT is validated.
   * The 'payload' is the decrypted object we put inside the token.
   * (In our case: { sub, email, role })
   */
  async validate(payload: any) {
    // We use the ID (sub) from the token to find the user
    // This ensures the user still exists in the database
    // Load profile relation eagerly for authorization guard
    const user = await this.userService.findOne(payload.sub);
    
    // If user is found, Passport attaches it to req.user
    // If not, it throws a 401 Unauthorized
    if (!user) {
      return null;
    }
    const { password, ...result } = user;
    return result;
  }
}