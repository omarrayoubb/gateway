import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollConfiguration } from './entities/payroll-configuration.entity';
import { PayrollConfigurationsService } from './payroll-configurations.service';
import { PayrollConfigurationsGrpcController } from './payroll-configurations.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PayrollConfiguration]),
  ],
  providers: [PayrollConfigurationsService],
  controllers: [PayrollConfigurationsGrpcController],
  exports: [PayrollConfigurationsService],
})
export class PayrollConfigurationsModule {}
