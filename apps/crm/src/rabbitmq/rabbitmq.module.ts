import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQService } from './rabbitmq.service';
import { UserSync } from '../users/users-sync.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSync]),
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}

