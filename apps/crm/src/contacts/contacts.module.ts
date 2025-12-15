import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Contact} from './entities/contacts.entity';
import { ContactsService } from './contacts.service';
import { ContactsGrpcController } from './contacts.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact]),
  ],
  providers: [ContactsService],
  controllers: [ContactsGrpcController],
  exports: [ContactsService],
})
export class ContactsModule {}