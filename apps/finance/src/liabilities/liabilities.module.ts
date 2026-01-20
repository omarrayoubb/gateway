import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiabilitiesService } from './liabilities.service';
import { LiabilitiesGrpcController } from './liabilities.grpc.controller';
import { Liability } from './entities/liability.entity';
import { Account } from '../accounts/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Liability, Account]),
  ],
  controllers: [LiabilitiesGrpcController],
  providers: [LiabilitiesService],
  exports: [LiabilitiesService],
})
export class LiabilitiesModule {}

