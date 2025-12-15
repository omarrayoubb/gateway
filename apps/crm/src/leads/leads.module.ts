import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './entities/lead.entity';
import { LeadsService } from './leads.service';
import { LeadsGrpcController } from './leads.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead]),
  ],
  providers: [LeadsService],
  controllers: [LeadsGrpcController],
  exports: [LeadsService],
})
export class LeadsModule {}