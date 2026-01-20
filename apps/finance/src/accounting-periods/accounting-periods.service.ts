import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AccountingPeriod, PeriodType, PeriodStatus } from './entities/accounting-period.entity';
import { CreateAccountingPeriodDto } from './dto/create-accounting-period.dto';
import { UpdateAccountingPeriodDto } from './dto/update-accounting-period.dto';
import { AccountingPeriodPaginationDto } from './dto/pagination.dto';
import { ClosePeriodDto } from './dto/close-period.dto';
import { GeneralLedger } from '../general-ledger/entities/general-ledger.entity';
import { JournalEntry, JournalEntryStatus } from '../journal-entries/entities/journal-entry.entity';

@Injectable()
export class AccountingPeriodsService {
  constructor(
    @InjectRepository(AccountingPeriod)
    private readonly accountingPeriodRepository: Repository<AccountingPeriod>,
    @InjectRepository(GeneralLedger)
    private readonly generalLedgerRepository: Repository<GeneralLedger>,
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepository: Repository<JournalEntry>,
  ) {}

  async create(createPeriodDto: CreateAccountingPeriodDto): Promise<AccountingPeriod> {
    try {
      // Validate required fields
      if (!createPeriodDto.period_name) {
        throw new BadRequestException('period_name is required');
      }
      if (!createPeriodDto.period_type) {
        throw new BadRequestException('period_type is required');
      }
      if (!createPeriodDto.period_start) {
        throw new BadRequestException('period_start is required');
      }
      if (!createPeriodDto.period_end) {
        throw new BadRequestException('period_end is required');
      }

      const periodStart = new Date(createPeriodDto.period_start);
      const periodEnd = new Date(createPeriodDto.period_end);

      if (periodStart >= periodEnd) {
        throw new BadRequestException('period_start must be before period_end');
      }

      // Check for overlapping periods
      const queryBuilder = this.accountingPeriodRepository.createQueryBuilder('period');
      
      if (createPeriodDto.organization_id) {
        queryBuilder.where('period.organizationId = :organizationId', { organizationId: createPeriodDto.organization_id });
      } else {
        queryBuilder.where('period.organizationId IS NULL');
      }

      queryBuilder.andWhere(
        '(period.periodStart <= :periodEnd AND period.periodEnd >= :periodStart)',
        { periodStart: periodStart, periodEnd: periodEnd }
      );

      const overlappingPeriod = await queryBuilder.getOne();

      if (overlappingPeriod) {
        throw new ConflictException('An accounting period already exists for this date range');
      }

      const period = this.accountingPeriodRepository.create({
        organizationId: createPeriodDto.organization_id || null,
        periodName: createPeriodDto.period_name,
        periodType: createPeriodDto.period_type,
        periodStart: periodStart,
        periodEnd: periodEnd,
        status: PeriodStatus.OPEN,
        notes: createPeriodDto.notes || null,
      });

      return await this.accountingPeriodRepository.save(period);
    } catch (error) {
      console.error('Error in AccountingPeriodsService.create:', error);
      throw error;
    }
  }

  async findAll(query: AccountingPeriodPaginationDto): Promise<AccountingPeriod[]> {
    try {
      const queryBuilder = this.accountingPeriodRepository.createQueryBuilder('period');

      if (query.status) {
        queryBuilder.where('period.status = :status', { status: query.status });
      }

      if (query.year) {
        const year = parseInt(query.year);
        if (!isNaN(year)) {
          const whereCondition = query.status ? 'andWhere' : 'where';
          queryBuilder[whereCondition](
            'EXTRACT(YEAR FROM period.periodStart) = :year OR EXTRACT(YEAR FROM period.periodEnd) = :year',
            { year },
          );
        }
      }

      queryBuilder.orderBy('period.periodStart', 'DESC');

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in AccountingPeriodsService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<AccountingPeriod> {
    const period = await this.accountingPeriodRepository.findOne({
      where: { id },
    });
    if (!period) {
      throw new NotFoundException(`Accounting period with ID ${id} not found`);
    }
    return period;
  }

  async getCurrentPeriod(organizationId?: string): Promise<AccountingPeriod | null> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const queryBuilder = this.accountingPeriodRepository
        .createQueryBuilder('period')
        .where('period.periodStart <= :today', { today })
        .andWhere('period.periodEnd >= :today', { today })
        .andWhere('period.status = :status', { status: PeriodStatus.OPEN });

      if (organizationId) {
        queryBuilder.andWhere('period.organizationId = :organizationId', { organizationId });
      } else {
        queryBuilder.andWhere('period.organizationId IS NULL');
      }

      queryBuilder.orderBy('period.periodStart', 'DESC').limit(1);

      return await queryBuilder.getOne();
    } catch (error) {
      console.error('Error in AccountingPeriodsService.getCurrentPeriod:', error);
      throw error;
    }
  }

  async update(id: string, updatePeriodDto: UpdateAccountingPeriodDto): Promise<AccountingPeriod> {
    const period = await this.findOne(id);

    if (period.status === PeriodStatus.LOCKED) {
      throw new BadRequestException('Cannot update a locked accounting period');
    }

    if (period.status === PeriodStatus.CLOSED && !updatePeriodDto.notes) {
      throw new BadRequestException('Cannot update a closed accounting period');
    }

    if (updatePeriodDto.period_start !== undefined) period.periodStart = new Date(updatePeriodDto.period_start);
    if (updatePeriodDto.period_end !== undefined) period.periodEnd = new Date(updatePeriodDto.period_end);
    if (updatePeriodDto.period_name !== undefined) period.periodName = updatePeriodDto.period_name;
    if (updatePeriodDto.period_type !== undefined) period.periodType = updatePeriodDto.period_type;
    if (updatePeriodDto.notes !== undefined) period.notes = updatePeriodDto.notes;

    if (period.periodStart >= period.periodEnd) {
      throw new BadRequestException('period_start must be before period_end');
    }

    return await this.accountingPeriodRepository.save(period);
  }

  async close(id: string, closeDto: ClosePeriodDto, closedBy?: string): Promise<any> {
    const period = await this.findOne(id);

    if (period.status === PeriodStatus.CLOSED) {
      throw new BadRequestException('Accounting period is already closed');
    }

    if (period.status === PeriodStatus.LOCKED) {
      throw new BadRequestException('Cannot close a locked accounting period');
    }

    // Get transactions in this period
    const transactions = await this.generalLedgerRepository.find({
      where: {
        transactionDate: Between(period.periodStart, period.periodEnd),
      },
    });

    // Get journal entries in this period
    const journalEntries = await this.journalEntryRepository.find({
      where: {
        entryDate: Between(period.periodStart, period.periodEnd),
      },
    });

    // Calculate summary
    let totalDebits = 0;
    let totalCredits = 0;
    let unbalancedEntries = 0;

    for (const trans of transactions) {
      totalDebits += parseFloat(trans.debit.toString());
      totalCredits += parseFloat(trans.credit.toString());
    }

    for (const entry of journalEntries) {
      if (!entry.isBalanced && entry.status === JournalEntryStatus.POSTED) {
        unbalancedEntries++;
      }
    }

    // Check if period can be closed
    if (!closeDto.force && unbalancedEntries > 0) {
      throw new BadRequestException(
        `Cannot close period: ${unbalancedEntries} unbalanced journal entries found. Use force=true to close anyway.`,
      );
    }

    // Close the period
    period.status = PeriodStatus.CLOSED;
    period.closedDate = new Date();
    period.closedBy = closedBy || null;
    if (closeDto.notes) {
      period.notes = period.notes ? `${period.notes}\nClosed: ${closeDto.notes}` : `Closed: ${closeDto.notes}`;
    }

    await this.accountingPeriodRepository.save(period);

    return {
      period,
      summary: {
        total_transactions: transactions.length,
        total_debits: totalDebits,
        total_credits: totalCredits,
        unbalanced_entries: unbalancedEntries,
      },
    };
  }

  async remove(id: string): Promise<void> {
    const period = await this.findOne(id);

    if (period.status === PeriodStatus.CLOSED || period.status === PeriodStatus.LOCKED) {
      throw new BadRequestException('Cannot delete a closed or locked accounting period');
    }

    await this.accountingPeriodRepository.remove(period);
  }
}

