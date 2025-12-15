import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateTicketDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';

export interface PaginatedTicketsResult {
  data: TicketResponseDto[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async create(createTicketDto: CreateTicketDto, currentUser: { id: string; name: string; email: string }): Promise<TicketResponseDto> {
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
    const savedTicket = await this.ticketRepository.save(ticket);
    
    const fullTicket = await this.getFullTicketById(savedTicket.id);
    return this._transformTicketToResponse(fullTicket);
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedTicketsResult> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    try {
      const [tickets, total] = await this.ticketRepository.findAndCount({
        relations: ['workOrders', 'comments', 'activities'],
        skip,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });

      const lastPage = Math.ceil(total / limit);
      const transformedData = tickets.map((ticket) => this._transformTicketToResponse(ticket));

      return {
        data: transformedData,
        total,
        page,
        lastPage,
      };
    } catch (error: any) {
      // If activities relation doesn't exist, try without it
      if (error?.code === '42P01' && error?.message?.includes('activities')) {
        const [tickets, total] = await this.ticketRepository.findAndCount({
          relations: ['workOrders', 'comments'],
          skip,
          take: limit,
          order: {
            createdAt: 'DESC',
          },
        });

        const lastPage = Math.ceil(total / limit);
        const transformedData = tickets.map((ticket) => this._transformTicketToResponse(ticket));

        return {
          data: transformedData,
          total,
          page,
          lastPage,
        };
      }
      throw error;
    }
  }

  async findOne(id: string): Promise<TicketResponseDto> {
    const ticket = await this.getFullTicketById(id);
    return this._transformTicketToResponse(ticket);
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, currentUser: { id: string; name: string; email: string }): Promise<TicketResponseDto> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    // Handle date conversions if provided
    const updateData: Partial<any> = { ...updateTicketDto };
    if (updateTicketDto.dateTime1) {
      updateData.dateTime1 = new Date(updateTicketDto.dateTime1);
    }
    if (updateTicketDto.dueDate) {
      updateData.dueDate = new Date(updateTicketDto.dueDate);
    }

    Object.assign(ticket, updateData);
    const savedTicket = await this.ticketRepository.save(ticket);
    
    const fullTicket = await this.getFullTicketById(savedTicket.id);
    return this._transformTicketToResponse(fullTicket);
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.ticketRepository.findOneBy({ id });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    await this.ticketRepository.remove(ticket);
  }

  async bulkRemove(bulkDeleteDto: BulkDeleteDto): Promise<BulkDeleteResponse> {
    const { ids } = bulkDeleteDto;
    const failedIds: Array<{ id: string; error: string }> = [];
    let deletedCount = 0;

    // Find all tickets that exist
    const tickets = await this.ticketRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(tickets.map((t) => t.id));

    // Track which IDs were not found
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedIds.push({ id, error: 'Ticket not found' });
      }
    }

    // Delete all found tickets
    if (tickets.length > 0) {
      await this.ticketRepository.remove(tickets);
      deletedCount = tickets.length;
    }

    return {
      deletedCount,
      ...(failedIds.length > 0 && { failedIds }),
    };
  }

  async bulkUpdate(bulkUpdateDto: BulkUpdateTicketDto, currentUser: { id: string; name: string; email: string }): Promise<BulkUpdateResponse> {
    const { ids, updateFields } = bulkUpdateDto;
    const failedItems: Array<{ id: string; error: string }> = [];
    let updatedCount = 0;

    // Find all tickets that exist
    const tickets = await this.ticketRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(tickets.map((t) => t.id));

    // Track which IDs were not found
    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedItems.push({ id, error: 'Ticket not found' });
      }
    }

    // Process each ticket
    for (const ticket of tickets) {
      // Skip if already failed validation
      if (failedItems.some((f) => f.id === ticket.id)) {
        continue;
      }

      try {
        // Handle date conversions if provided
        const updateData: Partial<any> = { ...updateFields };
        if (updateFields.dateTime1) {
          updateData.dateTime1 = new Date(updateFields.dateTime1);
        }
        if (updateFields.dueDate) {
          updateData.dueDate = new Date(updateFields.dueDate);
        }

        Object.assign(ticket, updateData);
        await this.ticketRepository.save(ticket);
        updatedCount++;
      } catch (error) {
        failedItems.push({
          id: ticket.id,
          error: error.message || 'Failed to update ticket',
        });
      }
    }

    return {
      updatedCount,
      ...(failedItems.length > 0 && { failedItems }),
    };
  }

  private async getFullTicketById(id: string): Promise<Ticket> {
    try {
      const ticket = await this.ticketRepository.findOne({
        where: { id },
        relations: ['workOrders', 'comments', 'activities'],
      });

      if (!ticket) {
        throw new NotFoundException(`Ticket with ID ${id} not found`);
      }

      return ticket;
    } catch (error: any) {
      // If activities relation doesn't exist, try without it
      if (error?.code === '42P01' && error?.message?.includes('activities')) {
        const ticket = await this.ticketRepository.findOne({
          where: { id },
          relations: ['workOrders', 'comments'],
        });

        if (!ticket) {
          throw new NotFoundException(`Ticket with ID ${id} not found`);
        }

        return ticket;
      }
      throw error;
    }
  }

  private _transformTicketToResponse(ticket: Ticket): TicketResponseDto {
    return {
      id: ticket.id,
      contactName: ticket.contactName,
      accountName: ticket.accountName,
      email: ticket.email,
      phone: ticket.phone,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      classification: ticket.classification,
      ticketOwner: ticket.ticketOwner,
      productName: ticket.productName,
      vendor: ticket.vendor,
      serialNumber: ticket.serialNumber,
      dateTime1: ticket.dateTime1,
      channel: ticket.channel,
      language: ticket.language,
      category: ticket.category,
      subcategory: ticket.subcategory,
      dueDate: ticket.dueDate,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      comments: ticket.comments?.map((comment) => ({
        id: comment.id,
        comment: comment.comment,
        author: comment.author,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      })),
      workOrders: ticket.workOrders?.map((workOrder) => ({
        id: workOrder.id,
        name: workOrder.summary || '',
      })),
      activities: ticket.activities?.map((activity) => ({
        id: activity.id,
        action: activity.action,
        performedBy: activity.performedBy,
        createdAt: activity.createdAt,
      })),
    };
  }
}
