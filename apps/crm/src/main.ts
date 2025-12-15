import { NestFactory } from '@nestjs/core';
import { CrmModule } from './crm.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GrpcLoggingInterceptor } from './interceptors/grpc-logging.interceptor';
async function bootstrap() {
  // inside bootstrap()
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(CrmModule, {
    transport: Transport.GRPC,
    options: {
      package: ['leads', 'profiles', 'contacts', 'deals', 'accounts', 'activities', 'orchestrator', 'roles', 'tasks'],
      protoPath: [
        join(__dirname, '../../../libs/common/src/proto/crm/leads.proto'),
        join(__dirname, '../../../libs/common/src/proto/crm/profiles.proto'),
        join(__dirname, '../../../libs/common/src/proto/crm/contacts.proto'),
        join(__dirname, '../../../libs/common/src/proto/crm/deals.proto'),
        join(__dirname, '../../../libs/common/src/proto/crm/accounts.proto'),
        join(__dirname, '../../../libs/common/src/proto/crm/activities.proto'),
        join(__dirname, '../../../libs/common/src/proto/crm/orchestrator.proto'),
        join(__dirname, '../../../libs/common/src/proto/crm/roles.proto'),
        join(__dirname, '../../../libs/common/src/proto/crm/tasks.proto'),
      ],
      url: '0.0.0.0:50052',
    },
  });
  app.useGlobalInterceptors(new GrpcLoggingInterceptor());
  await app.listen();
  console.log('CRM microservice is running on port 50052');
}
bootstrap();
