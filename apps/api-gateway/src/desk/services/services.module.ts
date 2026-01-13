import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'DESK_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: ['services'],
          url: '0.0.0.0:50053',
          protoPath: join(process.cwd(), 'proto/desk/services.proto'),
        },
      },
    ]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule { }

