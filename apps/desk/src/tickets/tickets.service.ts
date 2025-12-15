import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticketData: Partial<Ticket> = {
      ...createTicketDto,
      dateTime1: createTicketDto.dateTime1
        ? new Date(createTicketDto.dateTime1)
        : null,
      dueDate: createTicketDto.dueDate
        ? new Date(createTicketDto.dueDate)
        : null,
    };
    
    const ticket = this.ticketRepository.create(ticketData);
    return await this.ticketRepository.save(ticket);
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    // Handle date conversions if provided
    const updateData: any = { ...updateTicketDto };
    if (updateTicketDto.dateTime1) {
      updateData.dateTime1 = new Date(updateTicketDto.dateTime1);
    }
    if (updateTicketDto.dueDate) {
      updateData.dueDate = new Date(updateTicketDto.dueDate);
    }

    Object.assign(ticket, updateData);
    return await this.ticketRepository.save(ticket);
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['workOrders', 'comments', 'activities'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    // Transform work orders to return only id and name (summary) as reference
    if (ticket.workOrders) {
      (ticket as any).workOrders = ticket.workOrders.map((workOrder) => ({
        id: workOrder.id,
        name: workOrder.summary,
      }));
    }

    return ticket;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: any[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;

    // Only load workOrders relation (not comments/activities) for list view
    // Use select to limit fields from workOrders
    const [tickets, total] = await this.ticketRepository.findAndCount({
      relations: ['workOrders'],
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        contactName: true,
        accountName: true,
        email: true,
        phone: true,
        subject: true,
        description: true,
        status: true,
        priority: true,
        classification: true,
        ticketOwner: true,
        productName: true,
        vendor: true,
        serialNumber: true,
        dateTime1: true,
        channel: true,
        language: true,
        category: true,
        subcategory: true,
        dueDate: true,
        workOrders: {
          id: true,
          summary: true,
        },
      },
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    // Transform work orders to return only id and name (summary) as reference
    const transformedTickets = tickets.map((ticket) => ({
      ...ticket,
      workOrders: ticket.workOrders
        ? ticket.workOrders.map((workOrder) => ({
            id: workOrder.id,
            name: workOrder.summary,
          }))
        : [],
    }));

    return {
      data: transformedTickets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
