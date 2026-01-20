import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostCentersService } from './cost-centers.service';
import { CostCentersGrpcController } from './cost-centers.grpc.controller';
import { CostCenter } from './entities/cost-center.entity';
import { GeneralLedger } from '../general-ledger/entities/general-ledger.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CostCenter, GeneralLedger]),
  ],
  controllers: [CostCentersGrpcController],
  providers: [CostCentersService],
  exports: [CostCentersService],
})
export class CostCentersModule {}

