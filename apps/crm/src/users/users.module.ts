import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { UserSync } from './users-sync.entity';
import { UsersService } from './users.service';
import { UsersGrpcController } from './users.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSync]),
  ],
  providers: [UsersService],
  controllers: [UsersGrpcController],
  exports: [UsersService],
})
export class UsersModule {}
