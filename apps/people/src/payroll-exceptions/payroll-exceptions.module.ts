import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollException } from './entities/payroll-exception.entity';
import { PayrollExceptionsService } from './payroll-exceptions.service';
import { PayrollExceptionsGrpcController } from './payroll-exceptions.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PayrollException]),
  ],
  providers: [PayrollExceptionsService],
  controllers: [PayrollExceptionsGrpcController],
  exports: [PayrollExceptionsService],
})
export class PayrollExceptionsModule {}
