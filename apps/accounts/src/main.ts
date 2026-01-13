import { NestFactory } from '@nestjs/core';
import { AccountsModule } from './accounts.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AccountsModule, {
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(process.cwd(), 'proto/accounts/auth.proto'),
      url: '0.0.0.0:50051'
    },
  });
  await app.listen();
  console.log('Accounts microservice is running on port 50051');
}
bootstrap();
