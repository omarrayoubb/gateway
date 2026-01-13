import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'DESK_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: ['tickets'],
          url: '0.0.0.0:50053',
          protoPath: join(process.cwd(), 'proto/desk/tickets.proto'),
        },
      },
    ]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule { }

