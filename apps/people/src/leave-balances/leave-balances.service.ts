import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveBalance } from './entities/leave-balance.entity';
import { CreateLeaveBalanceDto } from './dto/create-leave-balance.dto';
import { UpdateLeaveBalanceDto } from './dto/update-leave-balance.dto';

@Injectable()
export class LeaveBalancesService {
  constructor(
    @InjectRepository(LeaveBalance)
    private readonly leaveBalanceRepository: Repository<LeaveBalance>,
  ) {}

  async create(createLeaveBalanceDto: CreateLeaveBalanceDto): Promise<LeaveBalance> {
    const leaveBalance = this.leaveBalanceRepository.create({
      ...createLeaveBalanceDto,
      balance: createLeaveBalanceDto.balance ?? 0,
      used: createLeaveBalanceDto.used ?? 0,
      accrued: createLeaveBalanceDto.accrued ?? 0,
      carriedForward: createLeaveBalanceDto.carriedForward ?? 0,
    });

    return await this.leaveBalanceRepository.save(leaveBalance);
  }

  async findAll(query: { employeeId?: string; leaveType?: string; year?: string }): Promise<LeaveBalance[]> {
    const queryBuilder = this.leaveBalanceRepository.createQueryBuilder('leave_balance');

    if (query.employeeId) {
      queryBuilder.where('leave_balance.employeeId = :employeeId', { employeeId: query.employeeId });
    }

    if (query.leaveType) {
      const whereCondition = query.employeeId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('leave_balance.leaveType = :leaveType', { leaveType: query.leaveType });
    }

    if (query.year) {
      const whereCondition = query.employeeId || query.leaveType ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('leave_balance.year = :year', { year: parseInt(query.year) });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<LeaveBalance> {
    const leaveBalance = await this.leaveBalanceRepository.findOne({
      where: { id },
    });

    if (!leaveBalance) {
      throw new NotFoundException(`Leave balance with ID ${id} not found`);
    }

    return leaveBalance;
  }

  async update(id: string, updateLeaveBalanceDto: UpdateLeaveBalanceDto): Promise<LeaveBalance> {
    const leaveBalance = await this.findOne(id);
    Object.assign(leaveBalance, updateLeaveBalanceDto);
    return await this.leaveBalanceRepository.save(leaveBalance);
  }

  async remove(id: string): Promise<void> {
    const leaveBalance = await this.findOne(id);
    await this.leaveBalanceRepository.remove(leaveBalance);
  }

  /**
   * Find balance by employee, leave type and year. Returns null if not found.
   */
  async findByEmployeeLeaveTypeYear(
    employeeId: string,
    leaveType: string,
    year: number,
  ): Promise<LeaveBalance | null> {
    return await this.leaveBalanceRepository.findOne({
      where: {
        employeeId,
        leaveType,
        year,
      },
    });
  }

  /**
   * Add or subtract days/hours from an employee's leave balance.
   * Positive balanceDelta = add days, negative = subtract.
   * Creates the balance record if it does not exist.
   */
  async adjustBalance(
    employeeId: string,
    leaveType: string,
    year: number,
    balanceDelta: number,
  ): Promise<LeaveBalance> {
    let leaveBalance = await this.findByEmployeeLeaveTypeYear(employeeId, leaveType, year);

    if (!leaveBalance) {
      leaveBalance = await this.create({
        employeeId,
        leaveType,
        year,
        balance: 0,
        used: 0,
        accrued: 0,
        carriedForward: 0,
      });
    }

    const currentBalance = Number(leaveBalance.balance);
    leaveBalance.balance = currentBalance + balanceDelta;
    return await this.leaveBalanceRepository.save(leaveBalance);
  }
}

