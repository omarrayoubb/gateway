import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessagesService } from './messages.service';
import { MessagesGrpcController } from './messages.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
  ],
  providers: [MessagesService],
  controllers: [MessagesGrpcController],
  exports: [MessagesService],
})
export class MessagesModule {}
