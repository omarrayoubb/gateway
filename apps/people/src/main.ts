import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
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

  // Create gRPC microservice only (no HTTP REST)
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'people',
      protoPath: join(process.cwd(), 'proto/people/people.proto'),
      url: '0.0.0.0:50056',
    },
  });

  await app.listen();
  console.log('People gRPC microservice is running on port 50056');
}
bootstrap();

