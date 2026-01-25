import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveBalance } from './entities/leave-balance.entity';
import { LeaveBalancesService } from './leave-balances.service';
import { LeaveBalancesGrpcController } from './leave-balances.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveBalance]),
  ],
  providers: [LeaveBalancesService],
  controllers: [LeaveBalancesGrpcController],
  exports: [LeaveBalancesService],
})
export class LeaveBalancesModule {}

