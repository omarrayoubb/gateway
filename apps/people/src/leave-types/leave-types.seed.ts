import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveType } from './entities/leave-type.entity';

@Injectable()
export class LeaveTypesSeedService {
  constructor(
    @InjectRepository(LeaveType)
    private readonly leaveTypeRepository: Repository<LeaveType>,
  ) {}

  async seed(): Promise<void> {
    const leaveTypes = [
      {
        name: 'Annual Leave',
        description: 'Annual vacation leave',
        quota: 21,
        carryForward: true,
        requiresApproval: true,
      },
      {
        name: 'Casual Leave',
        description: 'Casual leave for personal reasons',
        quota: 7,
        carryForward: false,
        requiresApproval: true,
      },
      {
        name: 'Business Trip',
        description: 'Leave for business travel',
        quota: 0,
        carryForward: false,
        requiresApproval: true,
      },
      {
        name: 'Marriage Leave',
        description: 'Leave for marriage',
        quota: 3,
        carryForward: false,
        requiresApproval: true,
      },
      {
        name: 'Funeral Leave',
        description: 'Bereavement leave',
        quota: 3,
        carryForward: false,
        requiresApproval: true,
      },
      {
        name: 'Hour(s) late/early Permission',
        description: 'Permission for late arrival or early departure',
        quota: 0,
        carryForward: false,
        requiresApproval: false,
      },
    ];

    for (const leaveTypeData of leaveTypes) {
      const existingLeaveType = await this.leaveTypeRepository.findOne({
        where: { name: leaveTypeData.name },
      });

      if (!existingLeaveType) {
        const leaveType = this.leaveTypeRepository.create(leaveTypeData);
        await this.leaveTypeRepository.save(leaveType);
        console.log(`✓ Seeded leave type: ${leaveTypeData.name}`);
      } else {
        console.log(`⊘ Leave type already exists: ${leaveTypeData.name}`);
      }
    }
  }
}

