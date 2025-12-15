import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrchestratorService } from './orchestrator.service';
import { OrchestratorController } from './orchestrator.controller';
import { UsersModule } from '../users/users.module';       
import { AccountsModule } from '../accounts/accounts.module';
import { LeadsModule } from '../leads/leads.module';
import { ContactsModule } from '../contacts/contacts.module';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { RolesModule } from '../roles/roles.module';
import { Lead } from '../leads/entities/lead.entity';
import { Contact } from '../contacts/entities/contacts.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, Contact]),
    UsersModule,    
    AccountsModule,
    LeadsModule,
    ContactsModule,
    ProfilesModule,
    RolesModule,
    AuthModule, // Import AuthModule to use AuthorizationGuard
  ],
  controllers: [OrchestratorController],
  providers: [OrchestratorService],
})
export class OrchestratorModule {}