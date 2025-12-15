import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  // Create gRPC microservice only (no HTTP REST)
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'desk',
      protoPath: join(__dirname, '../../../libs/common/src/proto/desk.proto'),
      url: '0.0.0.0:50053',
    },
  });

  await app.listen();
  console.log('Desk gRPC microservice is running on port 50053');
}
bootstrap();
