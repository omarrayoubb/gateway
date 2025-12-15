import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AccountsModule } from './accounts/accounts.module';
import { CrmModule } from './crm/crm.module';
import { LeadsModule } from './crm/leads/leads.module';
import { ProfilesModule } from './crm/profiles/profiles.module';
import { AuthModule } from './auth/auth.module';
import { ContactsModule } from './crm/contacts/contacts.module';
import { DealsModule } from './crm/deals/deals.module';
import { AccountsModule as CrmAccountsModule } from './crm/accounts/accounts.module';
import { ActivitiesModule } from './crm/activities/activities.module';
import { OrchestratorModule } from './crm/orchestrator/orchestrator.module';
import { RolesModule } from './crm/roles/roles.module';
import { TasksModule } from './crm/tasks/tasks.module';
import { TicketsModule } from './desk/tickets/tickets.module';
import { PartsModule } from './desk/parts/parts.module';
import { ServicesModule } from './desk/services/services.module';
import { WorkOrdersModule } from './desk/work-orders/work-orders.module';
import { KnowledgeBaseModule } from './desk/knowledge-base/knowledge-base.module';
import { ContactsModule as DeskContactsModule } from './desk/contacts/contacts.module';
import { AccountsModule as DeskAccountsModule } from './desk/accounts/accounts.module';


@Module({
  imports: [
    // Load environment variables FIRST - must be before other modules
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AccountsModule, 
    CrmModule, 
    LeadsModule, 
    ProfilesModule, 
    AuthModule, 
    ContactsModule,
    DealsModule,
    CrmAccountsModule,
    ActivitiesModule,
    OrchestratorModule,
    RolesModule,
    TasksModule,
    TicketsModule,
    PartsModule,
    ServicesModule,
    WorkOrdersModule,
    KnowledgeBaseModule,
    DeskContactsModule,
    DeskAccountsModule,
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}

