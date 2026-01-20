import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxConfiguration } from './entities/tax-configuration.entity';
import { TaxConfigurationsService } from './tax-configurations.service';
import { TaxConfigurationsGrpcController } from './tax-configurations.grpc.controller';
import { Account } from '../accounts/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaxConfiguration, Account]),
  ],
  providers: [TaxConfigurationsService],
  controllers: [TaxConfigurationsGrpcController],
  exports: [TaxConfigurationsService],
})
export class TaxConfigurationsModule {}

