import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PeopleModule } from './people/people.module';
import { DepartmentsModule } from './departments/departments.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AttendanceSummaryModule } from './attendance-summary/attendance-summary.module';
import { AttendancePolicyModule } from './attendance-policy/attendance-policy.module';
import { LeaveTypesModule } from './leave-types/leave-types.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';
import { LeaveBalancesModule } from './leave-balances/leave-balances.module';
import { LeaveApprovalsModule } from './leave-approvals/leave-approvals.module';
import { LeavePoliciesModule } from './leave-policies/leave-policies.module';
import { HolidaysModule } from './holidays/holidays.module';
import { LeaveAccrualsModule } from './leave-accruals/leave-accruals.module';
import { Employee } from './people/entities/person.entity';
import { Department } from './departments/entities/department.entity';
import { Attendance } from './attendance/entities/attendance.entity';
import { AttendanceSummary } from './attendance-summary/entities/attendance-summary.entity';
import { AttendancePolicy } from './attendance-policy/entities/attendance-policy.entity';
import { LeaveType } from './leave-types/entities/leave-type.entity';
import { LeaveRequest } from './leave-requests/entities/leave-request.entity';
import { LeaveBalance } from './leave-balances/entities/leave-balance.entity';
import { LeaveApproval } from './leave-approvals/entities/leave-approval.entity';
import { LeavePolicy } from './leave-policies/entities/leave-policy.entity';
import { Holiday } from './holidays/entities/holiday.entity';
import { LeaveAccrual } from './leave-accruals/entities/leave-accrual.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('PEOPLE_DB_HOST') || configService.get('DB_HOST') || 'localhost',
        port: configService.get('PEOPLE_DB_PORT') || configService.get('DB_PORT') || 5432,
        username: configService.get('PEOPLE_DB_USERNAME') || configService.get('DB_USERNAME') || 'postgres',
        password: configService.get('PEOPLE_DB_PASSWORD') || configService.get('DB_PASSWORD') || 'postgres',
        database: configService.get('PEOPLE_DB_DATABASE') || configService.get('DB_DATABASE') || 'people_db',
        entities: [
          Employee,
          Department,
          Attendance,
          AttendanceSummary,
          AttendancePolicy,
          LeaveType,
          LeaveRequest,
          LeaveBalance,
          LeaveApproval,
          LeavePolicy,
          Holiday,
          LeaveAccrual,
        ],
        synchronize: configService.get('PEOPLE_DB_SYNCHRONIZE') === 'true' || configService.get('DB_SYNCHRONIZE') === 'true',
      }),
    }),
    PeopleModule,
    DepartmentsModule,
    AttendanceModule,
    AttendanceSummaryModule,
    AttendancePolicyModule,
    LeaveTypesModule,
    LeaveRequestsModule,
    LeaveBalancesModule,
    LeaveApprovalsModule,
    LeavePoliciesModule,
    HolidaysModule,
    LeaveAccrualsModule,
  ],
})
export class AppModule {}

