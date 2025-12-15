import { Module } from '@nestjs/common';
import { DeskService } from './desk.service';
import { DeskController } from './desk.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'DESK_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'desk',
          url: '0.0.0.0:50053',
          protoPath: join(__dirname, '../../../libs/common/src/proto/desk.proto'),
        },
      },
    ]),
  ],
  controllers: [DeskController],
  providers: [DeskService],
})
export class DeskModule {}

