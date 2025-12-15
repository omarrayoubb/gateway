import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  Post, 
  Body, 
  Patch, 
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { DeskService } from './desk.service';
import { CreateTicketDto } from './dto/tickets/create-ticket.dto';
import { UpdateTicketDto } from './dto/tickets/update-ticket.dto';
import { CreateWorkOrderDto } from './dto/work-orders/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/work-orders/update-work-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('desk')
@UseGuards(JwtAuthGuard)
export class DeskController {
  constructor(private readonly deskService: DeskService) {}

  // ============================================
  // TICKETS ENDPOINTS
  // ============================================

  @Post('tickets')
  async createTicket(@Body() createTicketDto: CreateTicketDto) {
    const grpcData = {
      contactName: createTicketDto.contactName || '',
      accountName: createTicketDto.accountName || '',
      email: createTicketDto.email || '',
      phone: createTicketDto.phone || '',
      subject: createTicketDto.subject || '',
      description: createTicketDto.description || '',
      status: createTicketDto.status || 'Open',
      priority: createTicketDto.priority || 'Medium',
      classification: createTicketDto.classification || '',
    };
    return await this.deskService.createTicket(grpcData);
  }

  @Get('tickets')
  async getTickets(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.deskService.getTickets(page, limit);
  }

  @Get('tickets/:id')
  async getTicket(@Param('id') id: string) {
    return await this.deskService.getTicket(id);
  }

  @Patch('tickets/:id')
  async updateTicket(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    // UpdateTicketDto extends PartialType(CreateTicketDto), so all properties are optional
    // Pass the DTO directly, filtering out undefined values
    const grpcData = Object.fromEntries(
      Object.entries(updateTicketDto).filter(([_, v]) => v !== undefined)
    );
    return await this.deskService.updateTicket(id, grpcData);
  }

  // ============================================
  // WORK ORDERS ENDPOINTS
  // ============================================

  @Post('work-orders')
  async createWorkOrder(@Body() createWorkOrderDto: CreateWorkOrderDto) {
    const grpcData = {
      title: createWorkOrderDto.title || '',
      contact: createWorkOrderDto.contact || '',
      summary: createWorkOrderDto.summary || '',
      priority: createWorkOrderDto.priority || 'Medium',
    };
    return await this.deskService.createWorkOrder(grpcData);
  }

  @Get('work-orders')
  async getWorkOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.deskService.getWorkOrders(page, limit);
  }

  @Get('work-orders/:id')
  async getWorkOrder(@Param('id') id: string) {
    return await this.deskService.getWorkOrder(id);
  }

  @Patch('work-orders/:id')
  async updateWorkOrder(
    @Param('id') id: string,
    @Body() updateWorkOrderDto: UpdateWorkOrderDto,
  ) {
    // UpdateWorkOrderDto extends PartialType(CreateWorkOrderDto), so all properties are optional
    // Pass the DTO directly, filtering out undefined values
    const grpcData = Object.fromEntries(
      Object.entries(updateWorkOrderDto).filter(([_, v]) => v !== undefined)
    );
    return await this.deskService.updateWorkOrder(id, grpcData);
  }
}

