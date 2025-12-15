import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrder } from './entities/work-order.entity';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

@Injectable()
export class WorkOrdersService {
  constructor(
    @InjectRepository(WorkOrder)
    private readonly workOrderRepository: Repository<WorkOrder>,
  ) {}

  async create(createWorkOrderDto: CreateWorkOrderDto): Promise<WorkOrder> {
    const workOrderData: Partial<WorkOrder> = {
      ...createWorkOrderDto,
      dueDate: createWorkOrderDto.dueDate
        ? new Date(createWorkOrderDto.dueDate)
        : null,
    };

    const workOrder = this.workOrderRepository.create(workOrderData);
    return await this.workOrderRepository.save(workOrder);
  }

  async update(
    id: string,
    updateWorkOrderDto: UpdateWorkOrderDto,
  ): Promise<WorkOrder> {
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

    Object.assign(workOrder, updateData);
    return await this.workOrderRepository.save(workOrder);
  }

  async findOne(id: string): Promise<WorkOrder> {
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

    // Calculate totals
    const calculations = this.calculateTotals(workOrder);

    return {
      ...workOrder,
      ...calculations,
    } as any;
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

    // Load only essential relations for list view
    // Load nested relations only for calculations
    const [workOrders, total] = await this.workOrderRepository.findAndCount({
      relations: [
        'ticket',
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

    const workOrdersWithCalculations = workOrders.map((wo) => ({
      ...wo,
      ...this.calculateTotals(wo),
    }));

    return {
      data: workOrdersWithCalculations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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

