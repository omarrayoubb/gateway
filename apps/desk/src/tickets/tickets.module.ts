import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketComment } from './entities/ticket-comment.entity';
import { Activity } from '../activities/entities/activity.entity';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketComment, Activity])],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService, TypeOrmModule],
})
export class TicketsModule {}

