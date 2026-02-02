import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeavePolicy } from './entities/leave-policy.entity';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { UpdateLeavePolicyDto } from './dto/update-leave-policy.dto';

@Injectable()
export class LeavePoliciesService {
  constructor(
    @InjectRepository(LeavePolicy)
    private readonly leavePolicyRepository: Repository<LeavePolicy>,
  ) {}

  async create(createLeavePolicyDto: CreateLeavePolicyDto): Promise<LeavePolicy> {
    const leavePolicy = this.leavePolicyRepository.create(createLeavePolicyDto);
    return await this.leavePolicyRepository.save(leavePolicy);
  }

  async findAll(): Promise<LeavePolicy[]> {
    return await this.leavePolicyRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<LeavePolicy> {
    const leavePolicy = await this.leavePolicyRepository.findOne({
      where: { id },
    });

    if (!leavePolicy) {
      throw new NotFoundException(`Leave policy with ID ${id} not found`);
    }

    return leavePolicy;
  }

  async update(id: string, updateLeavePolicyDto: UpdateLeavePolicyDto): Promise<LeavePolicy> {
    const leavePolicy = await this.findOne(id);
    Object.assign(leavePolicy, updateLeavePolicyDto);
    return await this.leavePolicyRepository.save(leavePolicy);
  }

  async remove(id: string): Promise<void> {
    const leavePolicy = await this.findOne(id);
    await this.leavePolicyRepository.remove(leavePolicy);
  }
}

