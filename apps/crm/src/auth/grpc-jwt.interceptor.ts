import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSync } from '../users/users-sync.entity';

@Injectable()
export class GrpcJwtInterceptor implements NestInterceptor {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(UserSync)
    private userSyncRepository: Repository<UserSync>,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const rpcContext = context.switchToRpc().getContext();
    
    // Get metadata from gRPC context
    let metadata: any;
    if (rpcContext.getMetadataMap) {
      metadata = rpcContext.getMetadataMap();
    } else if (rpcContext.metadata) {
      metadata = rpcContext.metadata;
    } else {
      // Try to get from the call object
      const call = rpcContext.call || rpcContext;
      metadata = call?.metadata || {};
    }

    // Extract JWT token from metadata
    const authHeader = metadata.get?.('authorization')?.[0] || 
                       metadata.get?.('Authorization')?.[0] ||
                       metadata.authorization?.[0] ||
                       metadata.Authorization?.[0];
    
    if (!authHeader) {
      throw new RpcException({
        code: 16, // UNAUTHENTICATED
        message: 'Missing authorization token',
      });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.toString().replace('Bearer ', '');

    try {
      // Verify and decode JWT
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET')!,
      });

      // Validate user exists in CRM database
      const user = await this.userSyncRepository.findOne({
        where: { id: payload.sub },
        relations: ['role', 'profile'],
      });

      if (!user) {
        throw new RpcException({
          code: 16, // UNAUTHENTICATED
          message: 'User not found in CRM system',
        });
      }

      // Attach user to context for use in controllers
      rpcContext.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        workId: user.workId,
        roleId: user.roleId,
        role: user.role,
        profileId: user.profileId,
        profile: user.profile,
      };

      return next.handle();
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        code: 16, // UNAUTHENTICATED
        message: 'Invalid or expired token',
      });
    }
  }
}

