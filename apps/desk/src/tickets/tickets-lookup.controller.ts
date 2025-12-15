import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';

@Controller('tickets-lookup')
export class TicketsLookupController {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  @Get()
  async findAllForLookup() {
    const tickets = await this.ticketRepository.find({
      select: ['id', 'subject'],
      order: {
        createdAt: 'DESC',
      },
    });

    return tickets.map((ticket) => ({
      id: ticket.id,
      name: ticket.subject,
    }));
  }
}

