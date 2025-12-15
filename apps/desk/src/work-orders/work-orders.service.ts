import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { WorkOrder } from './entities/work-order.entity';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateWorkOrderDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';
import { WorkOrderResponseDto } from './dto/work-order-response.dto';

export interface PaginatedWorkOrdersResult {
  data: WorkOrderResponseDto[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class WorkOrdersService {
  constructor(
    @InjectRepository(WorkOrder)
    private readonly workOrderRepository: Repository<WorkOrder>,
  ) {}

  async create(createWorkOrderDto: CreateWorkOrderDto, currentUser: { id: string; name: string; email: string }): Promise<WorkOrderResponseDto> {
    const workOrderData: Partial<WorkOrder> = {
      ...createWorkOrderDto,
      dueDate: createWorkOrderDto.dueDate
        ? new Date(createWorkOrderDto.dueDate)
        : null,
      serviceAddress: createWorkOrderDto.serviceAddress ? (typeof createWorkOrderDto.serviceAddress === 'string' ? JSON.parse(createWorkOrderDto.serviceAddress) : createWorkOrderDto.serviceAddress) : null,
      billingAddress: createWorkOrderDto.billingAddress ? (typeof createWorkOrderDto.billingAddress === 'string' ? JSON.parse(createWorkOrderDto.billingAddress) : createWorkOrderDto.billingAddress) : null,
      createdBy: currentUser.name,
    };

    const workOrder = this.workOrderRepository.create(workOrderData);
    const savedWorkOrder = await this.workOrderRepository.save(workOrder);
    
    const fullWorkOrder = await this.getFullWorkOrderById(savedWorkOrder.id);
    return this._transformWorkOrderToResponse(fullWorkOrder);
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedWorkOrdersResult> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [workOrders, total] = await this.workOrderRepository.findAndCount({
      relations: [
        'ticket',
        'installationBase',
        'workOrderServices',
        'workOrderServices.service',
        'workOrderServices.tax',
        'workOrderParts',
        'workOrderParts.part',
        'workOrderParts.tax',
      ],
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    const lastPage = Math.ceil(total / limit);
    const transformedData = workOrders.map((wo) => this._transformWorkOrderToResponse(wo));

    return {
      data: transformedData,
      total,
      page,
      lastPage,
    };
  }

  async findOne(id: string): Promise<WorkOrderResponseDto> {
    const workOrder = await this.getFullWorkOrderById(id);
    return this._transformWorkOrderToResponse(workOrder);
  }

  async update(
    id: string,
    updateWorkOrderDto: UpdateWorkOrderDto,
    currentUser: { id: string; name: string; email: string },
  ): Promise<WorkOrderResponseDto> {
    const workOrder = await this.workOrderRepository.findOne({
      where: { id },
    });

    if (!workOrder) {
      throw new NotFoundException(`Work Order with ID ${id} not found`);
    }

    const updateData: any = { ...updateWorkOrderDto };
    if (updateWorkOrderDto.dueDate) {
      updateData.dueDate = new Date(updateWorkOrderDto.dueDate);
    }
    if (updateWorkOrderDto.serviceAddress !== undefined) {
      updateData.serviceAddress = typeof updateWorkOrderDto.serviceAddress === 'string' ? JSON.parse(updateWorkOrderDto.serviceAddress) : updateWorkOrderDto.serviceAddress;
    }
    if (updateWorkOrderDto.billingAddress !== undefined) {
      updateData.billingAddress = typeof updateWorkOrderDto.billingAddress === 'string' ? JSON.parse(updateWorkOrderDto.billingAddress) : updateWorkOrderDto.billingAddress;
    }

    Object.assign(workOrder, updateData);
    const savedWorkOrder = await this.workOrderRepository.save(workOrder);
    
    const fullWorkOrder = await this.getFullWorkOrderById(savedWorkOrder.id);
    return this._transformWorkOrderToResponse(fullWorkOrder);
  }

  async remove(id: string): Promise<void> {
    const workOrder = await this.workOrderRepository.findOneBy({ id });
    if (!workOrder) {
      throw new NotFoundException(`Work Order with ID ${id} not found`);
    }
    await this.workOrderRepository.remove(workOrder);
  }

  async bulkRemove(bulkDeleteDto: BulkDeleteDto): Promise<BulkDeleteResponse> {
    const { ids } = bulkDeleteDto;
    const failedIds: Array<{ id: string; error: string }> = [];
    let deletedCount = 0;

    const workOrders = await this.workOrderRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(workOrders.map((wo) => wo.id));

    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedIds.push({ id, error: 'Work Order not found' });
      }
    }

    if (workOrders.length > 0) {
      await this.workOrderRepository.remove(workOrders);
      deletedCount = workOrders.length;
    }

    return {
      deletedCount,
      ...(failedIds.length > 0 && { failedIds }),
    };
  }

  async bulkUpdate(bulkUpdateDto: BulkUpdateWorkOrderDto, currentUser: { id: string; name: string; email: string }): Promise<BulkUpdateResponse> {
    const { ids, updateFields } = bulkUpdateDto;
    const failedItems: Array<{ id: string; error: string }> = [];
    let updatedCount = 0;

    const workOrders = await this.workOrderRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(workOrders.map((wo) => wo.id));

    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedItems.push({ id, error: 'Work Order not found' });
      }
    }

    for (const workOrder of workOrders) {
      if (failedItems.some((f) => f.id === workOrder.id)) {
        continue;
      }

      try {
        const updateData: any = { ...updateFields };
        if (updateFields.dueDate) {
          updateData.dueDate = new Date(updateFields.dueDate);
        }
        if (updateFields.serviceAddress !== undefined) {
          updateData.serviceAddress = typeof updateFields.serviceAddress === 'string' ? JSON.parse(updateFields.serviceAddress) : updateFields.serviceAddress;
        }
        if (updateFields.billingAddress !== undefined) {
          updateData.billingAddress = typeof updateFields.billingAddress === 'string' ? JSON.parse(updateFields.billingAddress) : updateFields.billingAddress;
        }

        Object.assign(workOrder, updateData);
        await this.workOrderRepository.save(workOrder);
        updatedCount++;
      } catch (error) {
        failedItems.push({
          id: workOrder.id,
          error: error.message || 'Failed to update work order',
        });
      }
    }

    return {
      updatedCount,
      ...(failedItems.length > 0 && { failedItems }),
    };
  }

  private async getFullWorkOrderById(id: string): Promise<WorkOrder> {
    const workOrder = await this.workOrderRepository.findOne({
      where: { id },
      relations: [
        'ticket',
        'installationBase',
        'workOrderServices',
        'workOrderServices.service',
        'workOrderServices.tax',
        'workOrderParts',
        'workOrderParts.part',
        'workOrderParts.tax',
        'serviceAppointments',
        'parentWorkOrder',
        'childWorkOrders',
        'request',
      ],
    });

    if (!workOrder) {
      throw new NotFoundException(`Work Order with ID ${id} not found`);
    }

    return workOrder;
  }

  private _transformWorkOrderToResponse(workOrder: WorkOrder): WorkOrderResponseDto {
    const calculations = this.calculateTotals(workOrder);

    return {
      id: workOrder.id,
      title: workOrder.title,
      summary: workOrder.summary,
      agent: workOrder.agent,
      priority: workOrder.priority,
      dueDate: workOrder.dueDate,
      currency: workOrder.currency,
      exchangeRate: workOrder.exchangeRate,
      company: workOrder.company,
      contact: workOrder.contact,
      email: workOrder.email,
      phone: workOrder.phone,
      mobile: workOrder.mobile,
      serviceAddress: workOrder.serviceAddress,
      billingAddress: workOrder.billingAddress,
      termsAndConditions: workOrder.termsAndConditions,
      billingStatus: workOrder.billingStatus,
      ticketId: workOrder.ticketId,
      installationBaseId: workOrder.installationBaseId,
      parentWorkOrderId: workOrder.parentWorkOrderId,
      requestId: workOrder.requestId,
      createdBy: workOrder.createdBy,
      createdAt: workOrder.createdAt,
      updatedAt: workOrder.updatedAt,
      ...calculations,
      workOrderServices: workOrder.workOrderServices?.map((wos) => ({
        workOrderId: wos.workOrderId,
        serviceId: wos.serviceId,
        serviceName: wos.service?.name || '',
        quantity: wos.quantity,
        discount: wos.discount,
        taxId: wos.taxId,
        taxPercentage: wos.tax?.percentage || null,
        amount: wos.amount,
      })),
      workOrderParts: workOrder.workOrderParts?.map((wop) => ({
        workOrderId: wop.workOrderId,
        partId: wop.partId,
        partName: wop.part?.name || '',
        quantity: wop.quantity,
        discount: wop.discount,
        taxId: wop.taxId,
        taxPercentage: wop.tax?.percentage || null,
        amount: wop.amount,
      })),
      ticket: workOrder.ticket ? {
        id: workOrder.ticket.id,
        subject: workOrder.ticket.subject,
      } : undefined,
      installationBase: workOrder.installationBase ? {
        id: workOrder.installationBase.id,
        name: workOrder.installationBase.name,
      } : undefined,
    };
  }

  private calculateTotals(workOrder: WorkOrder): {
    servicesSubtotal: number;
    partsSubtotal: number;
    totalTax: number;
    totalDiscount: number;
    grandTotal: number;
  } {
    let servicesSubtotal = 0;
    let partsSubtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    // Calculate services
    if (workOrder.workOrderServices) {
      workOrder.workOrderServices.forEach((wos) => {
        const itemTotal = wos.amount * wos.quantity;
        const taxAmount = wos.tax ? (itemTotal * wos.tax.percentage) / 100 : 0;
        servicesSubtotal += itemTotal;
        totalTax += taxAmount;
        totalDiscount += wos.discount || 0;
      });
    }

    // Calculate parts
    if (workOrder.workOrderParts) {
      workOrder.workOrderParts.forEach((wop) => {
        const itemTotal = wop.amount * wop.quantity;
        const taxAmount = wop.tax ? (itemTotal * wop.tax.percentage) / 100 : 0;
        partsSubtotal += itemTotal;
        totalTax += taxAmount;
        totalDiscount += wop.discount || 0;
      });
    }

    const grandTotal =
      servicesSubtotal + partsSubtotal + totalTax - totalDiscount;

    return {
      servicesSubtotal,
      partsSubtotal,
      totalTax,
      totalDiscount,
      grandTotal,
    };
  }
}

