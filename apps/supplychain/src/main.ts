import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  // Create gRPC microservice only (no HTTP REST)
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'supplychain',
      protoPath: join(__dirname, '../../../libs/common/src/proto/supplychain/supplychain.proto'),
      url: '0.0.0.0:50054',
    },
  });

  await app.listen();
  console.log('Supply Chain gRPC microservice is running on port 50054');
}
bootstrap();

