import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Employee } from '../people/entities/person.entity';
import { UsersService } from './users.service';
import { UsersGrpcController } from './users.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Employee]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [UsersService],
  controllers: [UsersGrpcController],
  exports: [UsersService],
})
export class UsersModule {}
