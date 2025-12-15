import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrchestratorService } from './orchestrator.service';
import { OrchestratorController } from './orchestrator.controller';
import { AccountsModule } from '../accounts/accounts.module';
import { ContactsModule } from '../contacts/contacts.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { RolesModule } from '../roles/roles.module';
import { Lead } from '../leads/entities/lead.entity';
import { Contact } from '../contacts/entities/contacts.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, Contact, User]),
    AccountsModule,
    ContactsModule,
    ProfilesModule,
    RolesModule,
  ],
  controllers: [OrchestratorController],
  providers: [OrchestratorService],
  exports: [OrchestratorService],
})
export class OrchestratorModule {}