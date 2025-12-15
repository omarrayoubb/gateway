import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/accounts.entity';
import { AccountsService } from './accounts.service';
import { AccountsGrpcController } from './accounts.grpc.controller';
import { UserSync } from '../users/users-sync.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, UserSync]),
  ],
  providers: [AccountsService],
  controllers: [AccountsGrpcController],
  exports: [AccountsService],
})
export class AccountsModule {}