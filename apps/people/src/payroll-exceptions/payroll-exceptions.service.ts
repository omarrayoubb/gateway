import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollException } from './entities/payroll-exception.entity';
import { CreatePayrollExceptionDto } from './dto/create-payroll-exception.dto';

@Injectable()
export class PayrollExceptionsService {
  constructor(
    @InjectRepository(PayrollException)
    private readonly payrollExceptionRepository: Repository<PayrollException>,
  ) {}

  async findAll(): Promise<PayrollException[]> {
    return await this.payrollExceptionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(createPayrollExceptionDto: CreatePayrollExceptionDto): Promise<PayrollException> {
    const payrollException = this.payrollExceptionRepository.create({
      ...createPayrollExceptionDto,
    });

    return await this.payrollExceptionRepository.save(payrollException);
  }
}
