import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurringBill, RecurringBillFrequency } from './entities/recurring-bill.entity';
import { CreateRecurringBillDto } from './dto/create-recurring-bill.dto';
import { RecurringBillPaginationDto } from './dto/pagination.dto';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class RecurringBillsService {
  constructor(
    @InjectRepository(RecurringBill)
    private readonly recurringBillRepository: Repository<RecurringBill>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(createRecurringBillDto: CreateRecurringBillDto): Promise<RecurringBill> {
    try {
      // Validate required fields
      if (!createRecurringBillDto.bill_name) {
        throw new BadRequestException('bill_name is required');
      }
      if (!createRecurringBillDto.vendor_id) {
        throw new BadRequestException('vendor_id is required');
      }
      if (!createRecurringBillDto.frequency) {
        throw new BadRequestException('frequency is required');
      }
      if (!createRecurringBillDto.start_date) {
        throw new BadRequestException('start_date is required');
      }
      if (!createRecurringBillDto.account_id) {
        throw new BadRequestException('account_id is required');
      }

      // Auto-fetch organization_id if not provided
      let organizationId: string | null = createRecurringBillDto.organization_id || null;
      if (!organizationId) {
        const organizations = await this.organizationsService.findAll({});
        if (organizations && organizations.length > 0) {
          organizationId = organizations[0].id;
        }
      }

      // Calculate next_due_date based on start_date and frequency
      const startDate = new Date(createRecurringBillDto.start_date);
      const nextDueDate = this.calculateNextDueDate(startDate, createRecurringBillDto.frequency);

      const recurringBill = this.recurringBillRepository.create({
        organizationId: organizationId,
        billName: createRecurringBillDto.bill_name,
        vendorId: createRecurringBillDto.vendor_id,
        vendorName: createRecurringBillDto.vendor_id, // Will be populated from supply chain if needed
        category: createRecurringBillDto.category || null,
        amount: createRecurringBillDto.amount || 0,
        currency: createRecurringBillDto.currency || 'USD',
        frequency: createRecurringBillDto.frequency,
        startDate: startDate,
        endDate: createRecurringBillDto.end_date ? new Date(createRecurringBillDto.end_date) : null,
        nextDueDate: nextDueDate,
        isActive: createRecurringBillDto.is_active !== undefined ? createRecurringBillDto.is_active : true,
        autoCreate: createRecurringBillDto.auto_create !== undefined ? createRecurringBillDto.auto_create : false,
        accountId: createRecurringBillDto.account_id,
      });

      return await this.recurringBillRepository.save(recurringBill);
    } catch (error) {
      console.error('Error in RecurringBillsService.create:', error);
      throw error;
    }
  }

  async findAll(query: RecurringBillPaginationDto): Promise<RecurringBill[]> {
    try {
      const queryBuilder = this.recurringBillRepository
        .createQueryBuilder('recurringBill');

      if (query.is_active !== undefined) {
        queryBuilder.where('recurringBill.isActive = :isActive', { isActive: query.is_active });
      }

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
          'bill_name': 'billName',
          'start_date': 'startDate',
          'end_date': 'endDate',
          'next_due_date': 'nextDueDate',
          'amount': 'amount',
          'created_date': 'createdDate',
          'updated_at': 'updatedAt',
        };

        const entityField = fieldMap[sortField] || sortField;

        if (entityField && entityField.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(entityField)) {
          try {
            queryBuilder.orderBy(`recurringBill.${entityField}`, sortOrder);
          } catch (error) {
            queryBuilder.orderBy('recurringBill.createdDate', 'DESC');
          }
        } else {
          queryBuilder.orderBy('recurringBill.createdDate', 'DESC');
        }
      } else {
        queryBuilder.orderBy('recurringBill.createdDate', 'DESC');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in RecurringBillsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<RecurringBill> {
    const recurringBill = await this.recurringBillRepository.findOne({
      where: { id },
    });
    if (!recurringBill) {
      throw new NotFoundException(`Recurring bill with ID ${id} not found`);
    }
    return recurringBill;
  }

  async remove(id: string): Promise<void> {
    const recurringBill = await this.findOne(id);
    await this.recurringBillRepository.remove(recurringBill);
  }

  private calculateNextDueDate(startDate: Date, frequency: RecurringBillFrequency): Date {
    const nextDate = new Date(startDate);
    
    switch (frequency) {
      case RecurringBillFrequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case RecurringBillFrequency.QUARTERLY:
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case RecurringBillFrequency.ANNUALLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    
    return nextDate;
  }
}

