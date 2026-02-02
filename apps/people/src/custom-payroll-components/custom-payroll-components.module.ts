import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomPayrollComponent } from './entities/custom-payroll-component.entity';
import { CustomPayrollComponentsService } from './custom-payroll-components.service';
import { CustomPayrollComponentsGrpcController } from './custom-payroll-components.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomPayrollComponent]),
  ],
  providers: [CustomPayrollComponentsService],
  controllers: [CustomPayrollComponentsGrpcController],
  exports: [CustomPayrollComponentsService],
})
export class CustomPayrollComponentsModule {}
