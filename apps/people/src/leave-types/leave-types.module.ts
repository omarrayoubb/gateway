import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveType } from './entities/leave-type.entity';
import { LeaveTypesService } from './leave-types.service';
import { LeaveTypesGrpcController } from './leave-types.grpc.controller';
import { LeaveTypesSeedService } from './leave-types.seed';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveType]),
  ],
  providers: [LeaveTypesService, LeaveTypesSeedService],
  controllers: [LeaveTypesGrpcController],
  exports: [LeaveTypesService, LeaveTypesSeedService],
})
export class LeaveTypesModule {}

