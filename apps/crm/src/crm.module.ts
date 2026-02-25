import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { LeadsModule } from './leads/leads.module';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { ProfilesModule } from './profiles/profiles.module';
import { ContactsModule } from './contacts/contacts.module';
import { DealsModule } from './deals/deals.module';
import { AccountsModule } from './accounts/accounts.module';
import { ActivitiesModule } from './activities/activities.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { TasksModule } from './tasks/tasks.module';
import { RFQsModule } from './rfqs/rfqs.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';
import { Lead } from './leads/entities/lead.entity';
import { Profile } from './profiles/entities/profile.entity';
import { User } from './users/entities/user.entity';
import { Contact } from './contacts/entities/contacts.entity';
import { Deal } from './deals/entities/deal.entity';
import { Account } from './accounts/entities/accounts.entity';
import { Activity } from './activities/entities/activity.entity';
import { Role } from './roles/entities/role.entity';
import { Task } from './tasks/entities/task.entity';
import { RFQ } from './rfqs/entities/rfq.entity';
import { RFQProduct } from './rfqs/entities/rfq-product.entity';
import { SalesOrder } from './sales-orders/entities/sales-order.entity';
import { SalesOrderProduct } from './sales-orders/entities/sales-order-product.entity';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Configure TypeORM with PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('CRM_DB_HOST'),
        port: configService.get('CRM_DB_PORT'),
        username: configService.get('CRM_DB_USERNAME'),
        password: configService.get('CRM_DB_PASSWORD'),
        database: configService.get('CRM_DB_DATABASE'),
        entities: [Lead, Profile, User, Contact, Deal, Account, Activity, Role, Task, RFQ, RFQProduct, SalesOrder, SalesOrderProduct],
        synchronize: configService.get('CRM_DB_SYNCHRONIZE') === 'true',
      }),
    }),
    // Register User entity for dependency injection
    TypeOrmModule.forFeature([User]),
    LeadsModule,
    ProfilesModule,
    ContactsModule,
    DealsModule,
    AccountsModule,
    ActivitiesModule,
    OrchestratorModule,
    TasksModule,
    RFQsModule,
    SalesOrdersModule,
  ],
  controllers: [CrmController, UsersController],
  providers: [CrmService, UsersService],
})
export class CrmModule {}
