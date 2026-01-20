import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { PaymentSchedule, PaymentScheduleStatus, PaymentSchedulePriority } from './entities/payment-schedule.entity';
import { CreatePaymentScheduleDto } from './dto/create-payment-schedule.dto';
import { PaymentSchedulePaginationDto } from './dto/pagination.dto';
import { PurchaseBill } from '../purchase-bills/entities/purchase-bill.entity';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class PaymentSchedulesService {
  constructor(
    @InjectRepository(PaymentSchedule)
    private readonly paymentScheduleRepository: Repository<PaymentSchedule>,
    @InjectRepository(PurchaseBill)
    private readonly purchaseBillRepository: Repository<PurchaseBill>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(createScheduleDto: CreatePaymentScheduleDto): Promise<PaymentSchedule> {
    try {
      // Validate required fields
      if (!createScheduleDto.vendor_id) {
        throw new BadRequestException('vendor_id is required');
      }
      if (!createScheduleDto.bill_id) {
        throw new BadRequestException('bill_id is required');
      }
      if (!createScheduleDto.due_date) {
        throw new BadRequestException('due_date is required');
      }

      // Auto-fetch organization_id if not provided
      let organizationId: string | null = createScheduleDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations && organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      // Verify purchase bill exists and get bill details
      const bill = await this.purchaseBillRepository.findOne({
        where: { id: createScheduleDto.bill_id },
      });
      if (!bill) {
        throw new NotFoundException(`Purchase bill with ID ${createScheduleDto.bill_id} not found`);
      }

      // Use bill's balance_due if amount_due not provided
      const amountDue = createScheduleDto.amount_due !== undefined 
        ? createScheduleDto.amount_due 
        : bill.balanceDue;

      if (amountDue <= 0) {
        throw new BadRequestException('amount_due must be greater than 0');
      }

      // Determine initial status based on due date
      const dueDate = new Date(createScheduleDto.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);

      let status = PaymentScheduleStatus.PENDING;
      if (createScheduleDto.scheduled_payment_date) {
        status = PaymentScheduleStatus.SCHEDULED;
      } else if (dueDate < today) {
        status = PaymentScheduleStatus.OVERDUE;
      }

      const schedule = this.paymentScheduleRepository.create({
        organizationId: organizationId,
        vendorId: createScheduleDto.vendor_id,
        vendorName: bill.vendorName || createScheduleDto.vendor_id,
        billId: createScheduleDto.bill_id,
        billNumber: bill.billNumber,
        dueDate: dueDate,
        amountDue: amountDue,
        status: status,
        paymentMethod: createScheduleDto.payment_method || null,
        scheduledPaymentDate: createScheduleDto.scheduled_payment_date 
          ? new Date(createScheduleDto.scheduled_payment_date) 
          : null,
        priority: createScheduleDto.priority || PaymentSchedulePriority.MEDIUM,
      });

      return await this.paymentScheduleRepository.save(schedule);
    } catch (error) {
      console.error('Error in PaymentSchedulesService.create:', error);
      throw error;
    }
  }

  async findAll(query: PaymentSchedulePaginationDto): Promise<PaymentSchedule[]> {
    try {
      const queryBuilder = this.paymentScheduleRepository
        .createQueryBuilder('schedule');

      if (query.status) {
        queryBuilder.where('schedule.status = :status', { status: query.status });
      }

      if (query.vendor_id) {
        const whereCondition = query.status ? 'andWhere' : 'where';
        queryBuilder[whereCondition]('schedule.vendorId = :vendorId', { vendorId: query.vendor_id });
      }

      // Date range filtering
      if (query.due_date_from || query.due_date_to) {
        const whereCondition = query.status || query.vendor_id ? 'andWhere' : 'where';
        if (query.due_date_from && query.due_date_to) {
          queryBuilder[whereCondition]('schedule.dueDate BETWEEN :fromDate AND :toDate', {
            fromDate: query.due_date_from,
            toDate: query.due_date_to,
          });
        } else if (query.due_date_from) {
          queryBuilder[whereCondition]('schedule.dueDate >= :fromDate', {
            fromDate: query.due_date_from,
          });
        } else if (query.due_date_to) {
          queryBuilder[whereCondition]('schedule.dueDate <= :toDate', {
            toDate: query.due_date_to,
          });
        }
      }

      // Update overdue statuses
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await this.updateOverdueStatuses(today);

      // Apply sorting
      if (query.sort) {
        let sortField = query.sort.trim();
        let sortOrder: 'ASC' | 'DESC' = 'ASC';

        if (sortField.startsWith('-')) {
          sortField = sortField.substring(1).trim();
          sortOrder = 'DESC';
        } else if (sortField.includes(':')) {
          const [field, order] = sortField.split(':');
          sortField = field.trim();
          sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        }

        const fieldMap: { [key: string]: string } = {
          'due_date': 'dueDate',
          'scheduled_payment_date': 'scheduledPaymentDate',
          'amount_due': 'amountDue',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`schedule.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('schedule.dueDate', 'ASC');
          }
        } else {
          queryBuilder.orderBy('schedule.dueDate', 'ASC');
        }
      } else {
        queryBuilder.orderBy('schedule.dueDate', 'ASC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in PaymentSchedulesService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<PaymentSchedule> {
    const schedule = await this.paymentScheduleRepository.findOne({
      where: { id },
    });
    if (!schedule) {
      throw new NotFoundException(`Payment schedule with ID ${id} not found`);
    }
    return schedule;
  }

  async remove(id: string): Promise<void> {
    const schedule = await this.findOne(id);
    await this.paymentScheduleRepository.remove(schedule);
  }

  private async updateOverdueStatuses(today: Date): Promise<void> {
    // Update schedules that are past due date and not already paid
    await this.paymentScheduleRepository
      .createQueryBuilder()
      .update(PaymentSchedule)
      .set({ status: PaymentScheduleStatus.OVERDUE })
      .where('dueDate < :today', { today })
      .andWhere('status != :paid', { paid: PaymentScheduleStatus.PAID })
      .andWhere('status != :overdue', { overdue: PaymentScheduleStatus.OVERDUE })
      .execute();
  }
}

