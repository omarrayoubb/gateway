import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * This guard triggers the 'jwt' strategy defined in jwt.strategy.ts
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}