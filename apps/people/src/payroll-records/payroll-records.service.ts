import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollRecord } from './entities/payroll-record.entity';
import { CreatePayrollRecordDto } from './dto/create-payroll-record.dto';
import { UpdatePayrollRecordDto } from './dto/update-payroll-record.dto';

@Injectable()
export class PayrollRecordsService {
  constructor(
    @InjectRepository(PayrollRecord)
    private readonly payrollRecordRepository: Repository<PayrollRecord>,
  ) {}

  async create(createPayrollRecordDto: CreatePayrollRecordDto): Promise<PayrollRecord> {
    const payrollRecord = this.payrollRecordRepository.create({
      ...createPayrollRecordDto,
      paymentDate: createPayrollRecordDto.paymentDate 
        ? new Date(createPayrollRecordDto.paymentDate) 
        : null,
    });

    return await this.payrollRecordRepository.save(payrollRecord);
  }

  async findAll(query: { 
    sort?: string; 
    employee_id?: string; 
    employeeId?: string; 
    pay_period?: string;
    payPeriod?: string;
    status?: string;
  }): Promise<PayrollRecord[]> {
    const queryBuilder = this.payrollRecordRepository.createQueryBuilder('payroll_record');

    // Filter by employee_id if provided
    const employeeId = query.employee_id || query.employeeId;
    if (employeeId) {
      queryBuilder.where('payroll_record.employeeId = :employeeId', { employeeId });
    }

    // Filter by pay_period if provided
    const payPeriod = query.pay_period || query.payPeriod;
    if (payPeriod) {
      const whereCondition = employeeId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('payroll_record.payPeriod = :payPeriod', { payPeriod });
    }

    // Filter by status if provided
    if (query.status) {
      const whereCondition = (employeeId || payPeriod) ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('payroll_record.status = :status', { status: query.status });
    }

    // Handle sorting
    if (query.sort) {
      const sortField = query.sort.startsWith('-') ? query.sort.substring(1) : query.sort;
      const order = query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap: Record<string, string> = {
        'pay_period': 'payPeriod',
        'created_at': 'createdAt',
        'payment_date': 'paymentDate',
      };
      const dbField = fieldMap[sortField] || sortField;
      queryBuilder.orderBy(`payroll_record.${dbField}`, order);
    } else {
      queryBuilder.orderBy('payroll_record.payPeriod', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<PayrollRecord> {
    const payrollRecord = await this.payrollRecordRepository.findOne({
      where: { id },
    });

    if (!payrollRecord) {
      throw new NotFoundException(`Payroll record with ID ${id} not found`);
    }

    return payrollRecord;
  }

  async update(id: string, updatePayrollRecordDto: UpdatePayrollRecordDto): Promise<PayrollRecord> {
    const payrollRecord = await this.findOne(id);
    
    const updateData: any = { ...updatePayrollRecordDto };
    if (updatePayrollRecordDto.paymentDate) {
      updateData.paymentDate = new Date(updatePayrollRecordDto.paymentDate);
    }

    Object.assign(payrollRecord, updateData);
    return await this.payrollRecordRepository.save(payrollRecord);
  }

  async remove(id: string): Promise<void> {
    const payrollRecord = await this.findOne(id);
    await this.payrollRecordRepository.remove(payrollRecord);
  }
}
