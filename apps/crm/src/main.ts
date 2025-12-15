import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  // Create gRPC microservice only (no HTTP REST)
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'crm',
      protoPath: join(__dirname, '../../../libs/common/src/proto/crm.proto'),
      url: '0.0.0.0:50052',
    },
  });

  await app.listen();
  console.log('CRM gRPC microservice is running on port 50052');
}
bootstrap();