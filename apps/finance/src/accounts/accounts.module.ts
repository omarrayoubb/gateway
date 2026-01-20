import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { AccountsService } from './accounts.service';
import { AccountsGrpcController } from './accounts.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
  ],
  providers: [AccountsService],
  controllers: [AccountsGrpcController],
  exports: [AccountsService],
})
export class AccountsModule {}

