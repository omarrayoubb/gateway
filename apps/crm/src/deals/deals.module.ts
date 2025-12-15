import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal } from './entities/deal.entity';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';
import { Account } from '../accounts/entities/accounts.entity';
import { User } from '../users/entities/user.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Contact } from '../contacts/entities/contacts.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deal, Account, User, Lead, Contact]),
  ],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}

