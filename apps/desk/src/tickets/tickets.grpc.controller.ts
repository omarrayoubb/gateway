import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller()
export class TicketsGrpcController {
  constructor(private readonly ticketsService: TicketsService) {}

  @GrpcMethod('TicketsService', 'GetTicket')
  async getTicket(data: { id: string }) {
    const ticket = await this.ticketsService.findOne(data.id);
    return this.mapTicketToProto(ticket);
  }

  @GrpcMethod('TicketsService', 'GetTickets')
  async getTickets(data: { page?: number; limit?: number }) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const result = await this.ticketsService.findAll(page, limit);
    return {
      tickets: result.data.map(ticket => this.mapTicketToProto(ticket)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @GrpcMethod('TicketsService', 'CreateTicket')
  async createTicket(data: any) {
    const createDto: CreateTicketDto = {
      contactName: data.contactName || '',
      accountName: data.accountName || '',
      email: data.email || '',
      phone: data.phone || '',
      subject: data.subject || '',
      description: data.description || '',
      status: data.status || 'Open',
      priority: data.priority || 'Medium',
      classification: data.classification || '',
    };
    const ticket = await this.ticketsService.create(createDto);
    return this.mapTicketToProto(ticket);
  }

  @GrpcMethod('TicketsService', 'UpdateTicket')
  async updateTicket(data: any) {
    const updateDto: UpdateTicketDto = {
      contactName: data.contactName,
      accountName: data.accountName,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      description: data.description,
      status: data.status,
      priority: data.priority,
      classification: data.classification,
    };
    const ticket = await this.ticketsService.update(data.id, updateDto);
    return this.mapTicketToProto(ticket);
  }

  private mapTicketToProto(ticket: any) {
    return {
      id: ticket.id,
      accountId: '', // Not in entity
      contactId: '', // Not in entity
      contactName: ticket.contactName || '',
      accountName: ticket.accountName || '',
      email: ticket.email || '',
      phone: ticket.phone || '',
      subject: ticket.subject || '',
      description: ticket.description || '',
      status: ticket.status || '',
      priority: ticket.priority || '',
      classification: ticket.classification || '',
      created_at: ticket.createdAt?.toISOString() || '',
      updated_at: ticket.updatedAt?.toISOString() || '',
    };
  }
}

