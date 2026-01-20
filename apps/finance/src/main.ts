import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  // Create gRPC microservice only (no HTTP REST)
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'finance',
      protoPath: join(process.cwd(), 'proto/finance/finance.proto'),
      url: '0.0.0.0:50055',
    },
  });

  await app.listen();
  console.log('Finance gRPC microservice is running on port 50055');
}
bootstrap();

