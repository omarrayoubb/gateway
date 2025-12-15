import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrmClientModule } from './crm/crm-client.module';

// Entities
import { Service } from './services/entities/service.entity';
import { Part } from './parts/entities/part.entity';
import { InstallationBase } from './parts/entities/installation-base.entity';
import { Tax } from './taxes/entities/tax.entity';
import { FieldAgent } from './field-agents/entities/field-agent.entity';
import { Ticket } from './tickets/entities/ticket.entity';
import { TicketComment } from './tickets/entities/ticket-comment.entity';
import { Request } from './requests/entities/request.entity';
import { RequestNote } from './requests/entities/request-note.entity';
import { Note } from './notes/entities/note.entity';
import { Estimate } from './estimates/entities/estimate.entity';
import { EstimateService } from './estimates/entities/estimate-service.entity';
import { EstimatePart } from './estimates/entities/estimate-part.entity';
import { WorkOrder } from './work-orders/entities/work-order.entity';
import { WorkOrderService } from './work-orders/entities/work-order-service.entity';
import { WorkOrderPart } from './work-orders/entities/work-order-part.entity';
import { ServiceAppointment } from './service-appointments/entities/service-appointment.entity';
import { ServiceReport } from './service-reports/entities/service-report.entity';
import { ScheduleMaintenance } from './schedule-maintenance/entities/schedule-maintenance.entity';
import { MaintenanceContract } from './schedule-maintenance/entities/maintenance-contract.entity';
import { TimeSheet } from './time-sheets/entities/time-sheet.entity';
import { KnowledgeBase } from './knowledge-base/entities/knowledge-base.entity';
import { Activity } from './activities/entities/activity.entity';

// Modules
import { ServicesModule } from './services/services.module';
import { PartsModule } from './parts/parts.module';
import { TaxesModule } from './taxes/taxes.module';
import { FieldAgentsModule } from './field-agents/field-agents.module';
import { TicketsModule } from './tickets/tickets.module';
import { RequestsModule } from './requests/requests.module';
import { NotesModule } from './notes/notes.module';
import { EstimatesModule } from './estimates/estimates.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { ServiceAppointmentsModule } from './service-appointments/service-appointments.module';
import { ServiceReportsModule } from './service-reports/service-reports.module';
import { ScheduleMaintenanceModule } from './schedule-maintenance/schedule-maintenance.module';
import { TimeSheetsModule } from './time-sheets/time-sheets.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { ActivitiesModule } from './activities/activities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'desk_backend'),
        entities: [
          Service,
          Part,
          InstallationBase,
          Tax,
          FieldAgent,
          Ticket,
          TicketComment,
          Request,
          RequestNote,
          Note,
          Estimate,
          EstimateService,
          EstimatePart,
          WorkOrder,
          WorkOrderService,
          WorkOrderPart,
          ServiceAppointment,
          ServiceReport,
          ScheduleMaintenance,
          MaintenanceContract,
          TimeSheet,
          KnowledgeBase,
          Activity,
        ],
        synchronize: true,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    ServicesModule,
    PartsModule,
    TaxesModule,
    FieldAgentsModule,
    TicketsModule,
    RequestsModule,
    NotesModule,
    EstimatesModule,
    WorkOrdersModule,
    ServiceAppointmentsModule,
    ServiceReportsModule,
    ScheduleMaintenanceModule,
    TimeSheetsModule,
    KnowledgeBaseModule,
    ActivitiesModule,
    CrmClientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
