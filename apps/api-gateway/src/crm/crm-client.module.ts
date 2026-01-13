import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Global()
@Module({
  imports: [
    // Shared CRM gRPC client with all packages
    ClientsModule.register([
      {
        name: 'CRM_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: ['leads', 'profiles', 'contacts', 'deals', 'accounts', 'activities', 'orchestrator', 'roles', 'tasks', 'rfqs'],
          url: process.env.CRM_GRPC_URL || '0.0.0.0:50052',
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
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class CrmClientModule {}

