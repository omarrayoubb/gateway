import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketComment } from './entities/ticket-comment.entity';
import { TicketsGrpcController } from './tickets.grpc.controller';
import { TicketsService } from './tickets.service';
import { CrmClientModule } from '../crm/crm-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketComment]),
    CrmClientModule,
  ],
  controllers: [TicketsGrpcController],
  providers: [TicketsService],
  exports: [TicketsService, TypeOrmModule],
})
export class TicketsModule {}

