import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomPayrollComponent } from './entities/custom-payroll-component.entity';
import { CreateCustomPayrollComponentDto } from './dto/create-custom-payroll-component.dto';

@Injectable()
export class CustomPayrollComponentsService {
  constructor(
    @InjectRepository(CustomPayrollComponent)
    private readonly customPayrollComponentRepository: Repository<CustomPayrollComponent>,
  ) {}

  async findAll(): Promise<CustomPayrollComponent[]> {
    return await this.customPayrollComponentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(createCustomPayrollComponentDto: CreateCustomPayrollComponentDto): Promise<CustomPayrollComponent> {
    const customPayrollComponent = this.customPayrollComponentRepository.create({
      ...createCustomPayrollComponentDto,
    });

    return await this.customPayrollComponentRepository.save(customPayrollComponent);
  }
}
