import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGrpcController } from './auth.grpc.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthorizationGuard } from './authorization.guard';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    RabbitMQModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: '180d'
        },
      }),
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, AuthorizationGuard],
  controllers: [AuthController, AuthGrpcController],
  exports: [AuthorizationGuard],
})
export class AuthModule {}
