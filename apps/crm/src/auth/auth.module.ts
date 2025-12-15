import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthorizationGuard } from './authorization.guard';
import { GrpcJwtInterceptor } from './grpc-jwt.interceptor';
import { GrpcAuthorizationInterceptor } from './grpc-authorization.interceptor';
import { UserSync } from '../users/users-sync.entity';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([UserSync]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: {
          expiresIn: '180d',
        },
      }),
    }),
  ],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    AuthorizationGuard,
    GrpcJwtInterceptor,
    GrpcAuthorizationInterceptor,
  ],
  exports: [
    JwtAuthGuard,
    AuthorizationGuard,
    GrpcJwtInterceptor,
    GrpcAuthorizationInterceptor,
    JwtModule,
  ],
})
export class AuthModule {}
