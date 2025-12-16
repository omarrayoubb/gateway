import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CRM_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: ['contacts'],
          url: '0.0.0.0:50052',
          protoPath: join(__dirname, '../../../libs/common/src/proto/crm/contacts.proto'),
        },
      },
    ]),
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}





