import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveAccrual } from './entities/leave-accrual.entity';
import { CreateLeaveAccrualDto } from './dto/create-leave-accrual.dto';
import { UpdateLeaveAccrualDto } from './dto/update-leave-accrual.dto';

@Injectable()
export class LeaveAccrualsService {
  constructor(
    @InjectRepository(LeaveAccrual)
    private readonly leaveAccrualRepository: Repository<LeaveAccrual>,
  ) {}

  async create(createLeaveAccrualDto: CreateLeaveAccrualDto): Promise<LeaveAccrual> {
    const leaveAccrual = this.leaveAccrualRepository.create({
      ...createLeaveAccrualDto,
      accrualDate: new Date(createLeaveAccrualDto.accrualDate),
    });

    return await this.leaveAccrualRepository.save(leaveAccrual);
  }

  async findAll(): Promise<LeaveAccrual[]> {
    return await this.leaveAccrualRepository.find({
      order: { accrualDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<LeaveAccrual> {
    const leaveAccrual = await this.leaveAccrualRepository.findOne({
      where: { id },
    });

    if (!leaveAccrual) {
      throw new NotFoundException(`Leave accrual with ID ${id} not found`);
    }

    return leaveAccrual;
  }

  async update(id: string, updateLeaveAccrualDto: UpdateLeaveAccrualDto): Promise<LeaveAccrual> {
    const leaveAccrual = await this.findOne(id);
    
    const updateData: any = { ...updateLeaveAccrualDto };
    if (updateLeaveAccrualDto.accrualDate) {
      updateData.accrualDate = new Date(updateLeaveAccrualDto.accrualDate);
    }

    Object.assign(leaveAccrual, updateData);
    return await this.leaveAccrualRepository.save(leaveAccrual);
  }

  async remove(id: string): Promise<void> {
    const leaveAccrual = await this.findOne(id);
    await this.leaveAccrualRepository.remove(leaveAccrual);
  }
}

