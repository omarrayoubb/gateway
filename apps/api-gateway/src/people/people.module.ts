import { Module } from '@nestjs/common';
import { PeopleService } from './people.service';
import { 
  PeopleController, 
  DepartmentsController, 
  AttendanceController,
  AttendanceSummaryController,
  AttendancePolicyController,
  LeaveTypesController,
  LeaveRequestsController,
  LeaveBalancesController,
  LeaveApprovalsController,
  LeavePoliciesController,
  HolidaysController,
  LeaveAccrualsController,
} from './people.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PEOPLE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'people',
          url: process.env.PEOPLE_GRPC_URL || 'people:50056',
          protoPath: join(process.cwd(), 'proto/people/people.proto'),
        },
      },
    ]),
  ],
  controllers: [
    PeopleController, 
    DepartmentsController,
    AttendanceController,
    AttendanceSummaryController,
    AttendancePolicyController,
    LeaveTypesController,
    LeaveRequestsController,
    LeaveBalancesController,
    LeaveApprovalsController,
    LeavePoliciesController,
    HolidaysController,
    LeaveAccrualsController,
  ],
  providers: [PeopleService],
})
export class PeopleModule {}

