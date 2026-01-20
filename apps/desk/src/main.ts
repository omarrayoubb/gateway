import { NestFactory } from '@nestjs/core';
import { DeskModule } from './desk.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GrpcLoggingInterceptor } from './interceptors/grpc-logging.interceptor';

async function bootstrap() {
  // Use process.cwd() to get the project root, which works from both src and dist
  const protoPath = (filename: string) => 
    join(process.cwd(), 'proto', 'desk', filename);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(DeskModule, {
    transport: Transport.GRPC,
    options: {
      package: [
        'tickets',
        'parts',
        'services',
        'workOrders',
        'activities',
        'estimates',
        'fieldAgents',
        'knowledgeBase',
        'notes',
        'requests',
        'scheduleMaintenance',
        'serviceAppointments',
        'serviceReports',
        'taxes',
        'timeSheets',
      ],
      protoPath: [
        protoPath('tickets.proto'),
        protoPath('parts.proto'),
        protoPath('services.proto'),
        protoPath('work-orders.proto'),
        protoPath('activities.proto'),
        protoPath('estimates.proto'),
        protoPath('field-agents.proto'),
        protoPath('knowledge-base.proto'),
        protoPath('notes.proto'),
        protoPath('requests.proto'),
        protoPath('schedule-maintenance.proto'),
        protoPath('service-appointments.proto'),
        protoPath('service-reports.proto'),
        protoPath('taxes.proto'),
        protoPath('time-sheets.proto'),
      ],
      url: '0.0.0.0:50053',
    },
  });
  app.useGlobalInterceptors(new GrpcLoggingInterceptor());
  await app.listen();
  console.log('Desk microservice is running on port 50053');
}
bootstrap();
