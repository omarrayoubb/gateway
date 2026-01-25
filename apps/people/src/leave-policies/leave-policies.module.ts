import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeavePolicy } from './entities/leave-policy.entity';
import { LeavePoliciesService } from './leave-policies.service';
import { LeavePoliciesGrpcController } from './leave-policies.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeavePolicy]),
  ],
  providers: [LeavePoliciesService],
  controllers: [LeavePoliciesGrpcController],
  exports: [LeavePoliciesService],
})
export class LeavePoliciesModule {}

