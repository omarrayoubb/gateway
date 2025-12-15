import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';

interface TicketsService {
  GetTicket(data: { id: string }): Observable<any>;
  GetTickets(data: { page?: number; limit?: number }): Observable<any>;
  CreateTicket(data: any): Observable<any>;
  UpdateTicket(data: any): Observable<any>;
}

interface WorkOrdersService {
  GetWorkOrder(data: { id: string }): Observable<any>;
  GetWorkOrders(data: { page?: number; limit?: number }): Observable<any>;
  CreateWorkOrder(data: any): Observable<any>;
  UpdateWorkOrder(data: any): Observable<any>;
}

@Injectable()
export class DeskService implements OnModuleInit {
  private ticketsService: TicketsService;
  private workOrdersService: WorkOrdersService;

  constructor(@Inject('DESK_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.ticketsService = this.client.getService<TicketsService>('TicketsService');
    this.workOrdersService = this.client.getService<WorkOrdersService>('WorkOrdersService');
  }

  // Tickets methods
  async getTicket(id: string) {
    return await firstValueFrom(this.ticketsService.GetTicket({ id }));
  }

  async getTickets(page = 1, limit = 10) {
    return await firstValueFrom(this.ticketsService.GetTickets({ page, limit }));
  }

  async createTicket(data: any) {
    return await firstValueFrom(this.ticketsService.CreateTicket(data));
  }

  async updateTicket(id: string, data: any) {
    return await firstValueFrom(this.ticketsService.UpdateTicket({ id, ...data }));
  }

  // Work Orders methods
  async getWorkOrder(id: string) {
    return await firstValueFrom(this.workOrdersService.GetWorkOrder({ id }));
  }

  async getWorkOrders(page = 1, limit = 10) {
    return await firstValueFrom(this.workOrdersService.GetWorkOrders({ page, limit }));
  }

  async createWorkOrder(data: any) {
    return await firstValueFrom(this.workOrdersService.CreateWorkOrder(data));
  }

  async updateWorkOrder(id: string, data: any) {
    return await firstValueFrom(this.workOrdersService.UpdateWorkOrder({ id, ...data }));
  }
}

