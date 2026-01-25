import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/person.entity';
import { PeopleService } from './people.service';
import { PeopleGrpcController } from './people.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
  ],
  providers: [PeopleService],
  controllers: [PeopleGrpcController],
  exports: [PeopleService],
})
export class PeopleModule {}

