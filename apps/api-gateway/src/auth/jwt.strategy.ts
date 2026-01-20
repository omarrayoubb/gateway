import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET') || 'default-secret';
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });

    // Log the secret being used (first few chars only for security)
    this.logger.log(`JWT Strategy initialized with secret: ${jwtSecret.substring(0, 10)}...`);
  }

  async validate(payload: JwtPayload) {
    this.logger.debug(`Validating JWT payload: ${JSON.stringify({ sub: payload.sub, email: payload.email, name: payload.name })}`);
    
    if (!payload.sub || !payload.email) {
      this.logger.warn(`Invalid token payload - missing sub or email: ${JSON.stringify(payload)}`);
      throw new UnauthorizedException('Invalid token payload: missing required fields');
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}

