import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { CrmClientModule } from './crm-client.module';
import { LeadsModule } from './leads/leads.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ContactsModule } from './contacts/contacts.module';
import { DealsModule } from './deals/deals.module';
import { AccountsModule } from './accounts/accounts.module';
import { ActivitiesModule } from './activities/activities.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { RolesModule } from './roles/roles.module';
import { TasksModule } from './tasks/tasks.module';
import { RFQsModule } from './rfqs/rfqs.module';

@Module({
  imports: [
    // Import the shared CRM client module (marked as @Global, so all sub-modules can access it)
    CrmClientModule,
    // Import all CRM sub-modules
    LeadsModule,
    ProfilesModule,
    ContactsModule,
    DealsModule,
    AccountsModule,
    ActivitiesModule,
    OrchestratorModule,
    RolesModule,
    TasksModule,
    RFQsModule,
  ],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [
    LeadsModule,
    ProfilesModule,
    ContactsModule,
    DealsModule,
    AccountsModule,
    ActivitiesModule,
    OrchestratorModule,
    RolesModule,
    TasksModule,
    RFQsModule,
  ],
})
export class CrmModule {}
