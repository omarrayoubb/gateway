import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsService } from './contracts.service';
import { ContractsGrpcController } from './contracts.grpc.controller';
import { Contract } from './entities/contract.entity';
import { ContractPayment } from './entities/contract-payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, ContractPayment]),
  ],
  controllers: [ContractsGrpcController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}

