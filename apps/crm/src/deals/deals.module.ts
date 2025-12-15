import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal } from './entities/deal.entity';
import { DealsService } from './deals.service';
import { DealsGrpcController } from './deals.grpc.controller';
import { Account } from '../accounts/entities/accounts.entity';
import { UserSync } from '../users/users-sync.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Contact } from '../contacts/entities/contacts.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Deal, Account, UserSync, Lead, Contact]),
  ],
  controllers: [DealsGrpcController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}

