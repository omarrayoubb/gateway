import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * This guard triggers the 'local' strategy defined in local.strategy.ts
 * It's just a simple class that extends the built-in AuthGuard.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
