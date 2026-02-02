import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollConfiguration } from './entities/payroll-configuration.entity';
import { CreatePayrollConfigurationDto } from './dto/create-payroll-configuration.dto';

@Injectable()
export class PayrollConfigurationsService {
  constructor(
    @InjectRepository(PayrollConfiguration)
    private readonly payrollConfigurationRepository: Repository<PayrollConfiguration>,
  ) {}

  async findAll(): Promise<PayrollConfiguration[]> {
    return await this.payrollConfigurationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(createPayrollConfigurationDto: CreatePayrollConfigurationDto): Promise<PayrollConfiguration> {
    const payrollConfiguration = this.payrollConfigurationRepository.create({
      ...createPayrollConfigurationDto,
    });

    return await this.payrollConfigurationRepository.save(payrollConfiguration);
  }
}
