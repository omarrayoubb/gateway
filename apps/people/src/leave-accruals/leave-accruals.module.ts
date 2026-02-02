import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveAccrual } from './entities/leave-accrual.entity';
import { LeaveAccrualsService } from './leave-accruals.service';
import { LeaveAccrualsGrpcController } from './leave-accruals.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveAccrual]),
  ],
  providers: [LeaveAccrualsService],
  controllers: [LeaveAccrualsGrpcController],
  exports: [LeaveAccrualsService],
})
export class LeaveAccrualsModule {}

