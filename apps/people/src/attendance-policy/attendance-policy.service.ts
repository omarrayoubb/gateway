import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendancePolicy } from './entities/attendance-policy.entity';
import { CreateAttendancePolicyDto } from './dto/create-attendance-policy.dto';
import { UpdateAttendancePolicyDto } from './dto/update-attendance-policy.dto';

@Injectable()
export class AttendancePolicyService {
  constructor(
    @InjectRepository(AttendancePolicy)
    private readonly policyRepository: Repository<AttendancePolicy>,
  ) {}

  async create(createPolicyDto: CreateAttendancePolicyDto): Promise<AttendancePolicy> {
    const policy = this.policyRepository.create(createPolicyDto);
    return await this.policyRepository.save(policy);
  }

  async findAll(): Promise<AttendancePolicy[]> {
    return await this.policyRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AttendancePolicy> {
    const policy = await this.policyRepository.findOne({
      where: { id },
    });

    if (!policy) {
      throw new NotFoundException(`Attendance policy with ID ${id} not found`);
    }

    return policy;
  }

  async update(id: string, updatePolicyDto: UpdateAttendancePolicyDto): Promise<AttendancePolicy> {
    const policy = await this.findOne(id);
    Object.assign(policy, updatePolicyDto);
    return await this.policyRepository.save(policy);
  }

  async remove(id: string): Promise<void> {
    const policy = await this.findOne(id);
    await this.policyRepository.remove(policy);
  }
}

