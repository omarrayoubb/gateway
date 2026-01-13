import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { PartsService } from './parts.service';
import { PartsController } from './parts.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'DESK_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: ['parts'],
          url: '0.0.0.0:50053',
          protoPath: join(process.cwd(), 'proto/desk/parts.proto'),
        },
      },
    ]),
  ],
  controllers: [PartsController],
  providers: [PartsService],
  exports: [PartsService],
})
export class PartsModule { }

