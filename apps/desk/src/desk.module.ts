import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeskController } from './desk.controller';
import { DeskService } from './desk.service';
import { TicketsModule } from './tickets/tickets.module';
import { PartsModule } from './parts/parts.module';
import { ServicesModule } from './services/services.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { ActivitiesModule } from './activities/activities.module';
import { EstimatesModule } from './estimates/estimates.module';
import { FieldAgentsModule } from './field-agents/field-agents.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { NotesModule } from './notes/notes.module';
import { RequestsModule } from './requests/requests.module';
import { ScheduleMaintenanceModule } from './schedule-maintenance/schedule-maintenance.module';
import { ServiceAppointmentsModule } from './service-appointments/service-appointments.module';
import { ServiceReportsModule } from './service-reports/service-reports.module';
import { TaxesModule } from './taxes/taxes.module';
import { TimeSheetsModule } from './time-sheets/time-sheets.module';
// Entities
import { Ticket } from './tickets/entities/ticket.entity';
import { TicketComment } from './tickets/entities/ticket-comment.entity';
import { Part } from './parts/entities/part.entity';
import { Service } from './services/entities/service.entity';
import { WorkOrder } from './work-orders/entities/work-order.entity';
import { WorkOrderService } from './work-orders/entities/work-order-service.entity';
import { WorkOrderPart } from './work-orders/entities/work-order-part.entity';
import { Activity } from './activities/entities/activity.entity';
import { Estimate } from './estimates/entities/estimate.entity';
import { EstimateService } from './estimates/entities/estimate-service.entity';
import { EstimatePart } from './estimates/entities/estimate-part.entity';
import { FieldAgent } from './field-agents/entities/field-agent.entity';
import { KnowledgeBase } from './knowledge-base/entities/knowledge-base.entity';
import { Note } from './notes/entities/note.entity';
import { Request } from './requests/entities/request.entity';
import { RequestNote } from './requests/entities/request-note.entity';
import { ScheduleMaintenance } from './schedule-maintenance/entities/schedule-maintenance.entity';
import { ServiceAppointment } from './service-appointments/entities/service-appointment.entity';
import { ServiceReport } from './service-reports/entities/service-report.entity';
import { Tax } from './taxes/entities/tax.entity';
import { TimeSheet } from './time-sheets/entities/time-sheet.entity';

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
        host: configService.get('DESK_DB_HOST'),
        port: configService.get('DESK_DB_PORT'),
        username: configService.get('DESK_DB_USERNAME'),
        password: configService.get('DESK_DB_PASSWORD'),
        database: configService.get('DESK_DB_DATABASE'),
        entities: [
          Ticket,
          TicketComment,
          Part,
          Service,
          WorkOrder,
          WorkOrderService,
          WorkOrderPart,
          Activity,
          Estimate,
          EstimateService,
          EstimatePart,
          FieldAgent,
          KnowledgeBase,
          Note,
          Request,
          RequestNote,
          ScheduleMaintenance,
          ServiceAppointment,
          ServiceReport,
          Tax,
          TimeSheet,
        ],
        synchronize: configService.get('DESK_DB_SYNCHRONIZE') === 'true',
      }),
    }),
    // Module imports
    TicketsModule,
    PartsModule,
    ServicesModule,
    WorkOrdersModule,
    ActivitiesModule,
    EstimatesModule,
    FieldAgentsModule,
    KnowledgeBaseModule,
    NotesModule,
    RequestsModule,
    ScheduleMaintenanceModule,
    ServiceAppointmentsModule,
    ServiceReportsModule,
    TaxesModule,
    TimeSheetsModule,
  ],
  controllers: [DeskController],
  providers: [DeskService],
})
export class DeskModule {}
