import { NestFactory } from '@nestjs/core';
import { AccountsModule } from './accounts.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  // Create HTTP REST application
  const app = await NestFactory.create(AccountsModule);

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }));

  // Connect gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, '../../../libs/common/src/proto/auth.proto'),
      url: '0.0.0.0:50051',
    },
  });

  // Start both HTTP and gRPC
  await app.startAllMicroservices();
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3004;
  await app.listen(port);

  console.log('Accounts HTTP REST API is running on port', port);
  console.log('Accounts gRPC microservice is running on port 50051');
}
bootstrap();
