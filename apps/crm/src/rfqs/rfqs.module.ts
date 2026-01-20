import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { RFQ } from './entities/rfq.entity';
import { RFQProduct } from './entities/rfq-product.entity';
import { RFQsService } from './rfqs.service';
import { RFQsController } from './rfqs.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RFQ, RFQProduct]),
    ConfigModule,
    ClientsModule.register([
      {
        name: 'SUPPLYCHAIN_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'supplychain',
          url: process.env.SUPPLYCHAIN_GRPC_URL || 'supplychain:50054',
          protoPath: join(process.cwd(), 'proto/supplychain/supplychain.proto'),
        },
      },
    ]),
  ],
  providers: [RFQsService],
  controllers: [RFQsController],
  exports: [RFQsService],
})
export class RFQsModule {}

