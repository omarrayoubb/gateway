import { NestFactory } from '@nestjs/core';
import { CrmModule } from './crm.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GrpcLoggingInterceptor } from './interceptors/grpc-logging.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(CrmModule);
  
  const configService = app.get(ConfigService);
  
  // Connect to gRPC transport
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: ['leads', 'profiles', 'contacts', 'deals', 'accounts', 'activities', 'orchestrator', 'roles', 'tasks', 'rfqs'],
      protoPath: [
        join(process.cwd(), 'proto/crm/leads.proto'),
        join(process.cwd(), 'proto/crm/profiles.proto'),
        join(process.cwd(), 'proto/crm/contacts.proto'),
        join(process.cwd(), 'proto/crm/deals.proto'),
        join(process.cwd(), 'proto/crm/accounts.proto'),
        join(process.cwd(), 'proto/crm/activities.proto'),
        join(process.cwd(), 'proto/crm/orchestrator.proto'),
        join(process.cwd(), 'proto/crm/roles.proto'),
        join(process.cwd(), 'proto/crm/tasks.proto'),
        join(process.cwd(), 'proto/crm/rfqs.proto'),
      ],
      url: '0.0.0.0:50052',
    },
  });

  // Connect to RabbitMQ transport for event consumption
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get('RABBITMQ_URL') || 'amqp://user:password@localhost:5672'],
      queue: 'user_created_queue',
      queueOptions: {
        durable: true,
      },
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
    },
  });

  app.useGlobalInterceptors(new GrpcLoggingInterceptor());
  
  await app.startAllMicroservices();
  await app.listen(3001);
  console.log('CRM microservice is running on port 50052 (gRPC) and consuming RabbitMQ events');
}
bootstrap();
