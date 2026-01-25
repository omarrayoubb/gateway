import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveType } from './entities/leave-type.entity';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';

@Injectable()
export class LeaveTypesService {
  constructor(
    @InjectRepository(LeaveType)
    private readonly leaveTypeRepository: Repository<LeaveType>,
  ) {}

  async create(createLeaveTypeDto: CreateLeaveTypeDto): Promise<LeaveType> {
    const leaveType = this.leaveTypeRepository.create({
      ...createLeaveTypeDto,
      quota: createLeaveTypeDto.quota ?? 0,
      carryForward: createLeaveTypeDto.carryForward ?? false,
      requiresApproval: createLeaveTypeDto.requiresApproval ?? true,
    });

    return await this.leaveTypeRepository.save(leaveType);
  }

  async findAll(): Promise<LeaveType[]> {
    return await this.leaveTypeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<LeaveType> {
    const leaveType = await this.leaveTypeRepository.findOne({
      where: { id },
    });

    if (!leaveType) {
      throw new NotFoundException(`Leave type with ID ${id} not found`);
    }

    return leaveType;
  }

  async update(id: string, updateLeaveTypeDto: UpdateLeaveTypeDto): Promise<LeaveType> {
    const leaveType = await this.findOne(id);
    Object.assign(leaveType, updateLeaveTypeDto);
    return await this.leaveTypeRepository.save(leaveType);
  }

  async remove(id: string): Promise<void> {
    const leaveType = await this.findOne(id);
    await this.leaveTypeRepository.remove(leaveType);
  }
}

