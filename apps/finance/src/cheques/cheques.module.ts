import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cheque } from './entities/cheque.entity';
import { ChequesService } from './cheques.service';
import { ChequesGrpcController } from './cheques.grpc.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { BankAccount } from '../bank-accounts/entities/bank-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cheque, BankAccount]),
    OrganizationsModule,
  ],
  providers: [ChequesService],
  controllers: [ChequesGrpcController],
  exports: [ChequesService],
})
export class ChequesModule {}

