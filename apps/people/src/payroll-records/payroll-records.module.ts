import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollRecord } from './entities/payroll-record.entity';
import { PayrollRecordsService } from './payroll-records.service';
import { PayrollRecordsGrpcController } from './payroll-records.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PayrollRecord]),
  ],
  providers: [PayrollRecordsService],
  controllers: [PayrollRecordsGrpcController],
  exports: [PayrollRecordsService],
})
export class PayrollRecordsModule {}
