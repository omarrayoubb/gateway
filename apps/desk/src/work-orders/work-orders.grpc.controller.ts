import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

@Controller()
export class WorkOrdersGrpcController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @GrpcMethod('WorkOrdersService', 'GetWorkOrder')
  async getWorkOrder(data: { id: string }) {
    const workOrder = await this.workOrdersService.findOne(data.id);
    return this.mapWorkOrderToProto(workOrder);
  }

  @GrpcMethod('WorkOrdersService', 'GetWorkOrders')
  async getWorkOrders(data: { page?: number; limit?: number }) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const result = await this.workOrdersService.findAll(page, limit);
    return {
      work_orders: result.data.map(wo => this.mapWorkOrderToProto(wo)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @GrpcMethod('WorkOrdersService', 'CreateWorkOrder')
  async createWorkOrder(data: any) {
    const createDto: CreateWorkOrderDto = {
      title: data.title || data.summary || 'Work Order',
      contact: data.contact || '',
      summary: data.summary || '',
      priority: data.priority || 'Medium',
    };
    const workOrder = await this.workOrdersService.create(createDto);
    return this.mapWorkOrderToProto(workOrder);
  }

  @GrpcMethod('WorkOrdersService', 'UpdateWorkOrder')
  async updateWorkOrder(data: any) {
    const updateDto: UpdateWorkOrderDto = {
      title: data.title,
      contact: data.contact,
      summary: data.summary,
      priority: data.priority,
    };
    const workOrder = await this.workOrdersService.update(data.id, updateDto);
    return this.mapWorkOrderToProto(workOrder);
  }

  private mapWorkOrderToProto(workOrder: any) {
    return {
      id: workOrder.id,
      contact: workOrder.contact || '',
      summary: workOrder.summary || '',
      description: workOrder.description || '',
      status: workOrder.status || '',
      priority: workOrder.priority || '',
      created_at: workOrder.createdAt?.toISOString() || '',
      updated_at: workOrder.updatedAt?.toISOString() || '',
    };
  }
}

