import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users.entity';
import { UsersService } from './users.service';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RabbitMQModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

