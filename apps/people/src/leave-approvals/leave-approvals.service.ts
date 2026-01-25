import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveApproval, LeaveApprovalStatus } from './entities/leave-approval.entity';
import { CreateLeaveApprovalDto } from './dto/create-leave-approval.dto';
import { UpdateLeaveApprovalDto } from './dto/update-leave-approval.dto';

@Injectable()
export class LeaveApprovalsService {
  constructor(
    @InjectRepository(LeaveApproval)
    private readonly leaveApprovalRepository: Repository<LeaveApproval>,
  ) {}

  async create(createLeaveApprovalDto: CreateLeaveApprovalDto): Promise<LeaveApproval> {
    const leaveApproval = this.leaveApprovalRepository.create({
      ...createLeaveApprovalDto,
      status: createLeaveApprovalDto.status || LeaveApprovalStatus.PENDING,
      approvedDate: createLeaveApprovalDto.approvedDate ? new Date(createLeaveApprovalDto.approvedDate) : null,
      rejectedDate: createLeaveApprovalDto.rejectedDate ? new Date(createLeaveApprovalDto.rejectedDate) : null,
    });

    return await this.leaveApprovalRepository.save(leaveApproval);
  }

  async findAll(query: { sort?: string }): Promise<LeaveApproval[]> {
    const queryBuilder = this.leaveApprovalRepository.createQueryBuilder('leave_approval');

    if (query.sort) {
      const sortField = query.sort.startsWith('-') ? query.sort.substring(1) : query.sort;
      const order = query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap: Record<string, string> = {
        'created_date': 'createdAt',
        'created_at': 'createdAt',
      };
      const dbField = fieldMap[sortField] || sortField;
      queryBuilder.orderBy(`leave_approval.${dbField}`, order);
    } else {
      queryBuilder.orderBy('leave_approval.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<LeaveApproval> {
    const leaveApproval = await this.leaveApprovalRepository.findOne({
      where: { id },
    });

    if (!leaveApproval) {
      throw new NotFoundException(`Leave approval with ID ${id} not found`);
    }

    return leaveApproval;
  }

  async update(id: string, updateLeaveApprovalDto: UpdateLeaveApprovalDto): Promise<LeaveApproval> {
    const leaveApproval = await this.findOne(id);
    
    const updateData: any = { ...updateLeaveApprovalDto };
    if (updateLeaveApprovalDto.approvedDate) {
      updateData.approvedDate = new Date(updateLeaveApprovalDto.approvedDate);
    }
    if (updateLeaveApprovalDto.rejectedDate) {
      updateData.rejectedDate = new Date(updateLeaveApprovalDto.rejectedDate);
    }

    Object.assign(leaveApproval, updateData);
    return await this.leaveApprovalRepository.save(leaveApproval);
  }

  async remove(id: string): Promise<void> {
    const leaveApproval = await this.findOne(id);
    await this.leaveApprovalRepository.remove(leaveApproval);
  }
}

