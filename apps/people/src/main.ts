import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { LeaveTypesSeedService } from './leave-types/leave-types.seed';

async function bootstrap() {
  // Create application context for seeding
  const appContext = await NestFactory.createApplicationContext(AppModule);

  // Seed leave types on startup
  try {
    const leaveTypesSeedService = appContext.get(LeaveTypesSeedService);
    await leaveTypesSeedService.seed();
    console.log('✓ Leave types seeded successfully');
  } catch (error) {
    console.error('⚠ Failed to seed leave types:', error.message);
  }
  await appContext.close();

  // Hybrid app: HTTP host + gRPC + RabbitMQ (same pattern as CRM)
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Connect gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'people',
      protoPath: join(process.cwd(), 'proto/people/people.proto'),
      url: '0.0.0.0:50056',
    },
  });

  // Connect RabbitMQ for user.created events (dedicated queue so People and CRM both receive)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get('RABBITMQ_URL') || 'amqp://user:password@localhost:5672'],
      queue: 'user_created_people',
      queueOptions: {
        durable: true,
      },
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
    },
  });

  await app.startAllMicroservices();
  console.log('People microservice is running on port 50056 (gRPC) and consuming RabbitMQ user.created events');
}
bootstrap();

