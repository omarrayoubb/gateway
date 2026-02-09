import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/person.entity';
import { PeopleUser } from './entities/people-user.entity';
import { PeopleService } from './people.service';
import { PeopleGrpcController } from './people.grpc.controller';
import { PeopleEventController } from './people.event.controller';
import { PeopleUserGrpcController } from './people-user.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, PeopleUser]),
  ],
  providers: [PeopleService],
  controllers: [PeopleGrpcController, PeopleEventController, PeopleUserGrpcController],
  exports: [PeopleService],
})
export class PeopleModule {}

