import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequest, LeaveRequestStatus } from './entities/leave-request.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { ApprovalsService } from '../approvals/approvals.service';
import { RequestType } from '../approvals/entities/approval.entity';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
    private readonly approvalsService: ApprovalsService,
  ) {}

  async create(createLeaveRequestDto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    // Validate that employeeId is provided
    if (!createLeaveRequestDto.employeeId) {
      throw new BadRequestException('employee_id is required to create a leave request with approval');
    }

    const leaveRequest = this.leaveRequestRepository.create({
      ...createLeaveRequestDto,
      employeeId: createLeaveRequestDto.employeeId,
      startDate: new Date(createLeaveRequestDto.startDate),
      endDate: new Date(createLeaveRequestDto.endDate),
      status: createLeaveRequestDto.status || LeaveRequestStatus.PENDING,
    });

    const savedLeaveRequest = await this.leaveRequestRepository.save(leaveRequest);

    // Automatically create an approval with the manager chain
    // The ApprovalsService will:
    // 1. Look up the employee's manager (via managerId)
    // 2. Build the approval chain (manager -> manager's manager -> ...)
    // 3. Set the first manager as currentApproverId
    try {
      await this.approvalsService.create({
        requestType: RequestType.LEAVE,
        requestId: savedLeaveRequest.id,
        requesterId: savedLeaveRequest.employeeId!, // Non-null assertion safe because we validated above
        approvalChain: [], // Empty array means auto-generate from manager hierarchy
      });
    } catch (error) {
      // If approval creation fails (e.g., no manager found), log but don't fail the leave request
      // The leave request will exist but with no approval (can be handled manually)
      console.warn(`Failed to create approval for leave request ${savedLeaveRequest.id}:`, error.message);
    }

    return savedLeaveRequest;
  }

  async findAll(query: { sort?: string; employee_id?: string; employeeId?: string; status?: string }): Promise<LeaveRequest[]> {
    const queryBuilder = this.leaveRequestRepository.createQueryBuilder('leave_request');

    // Filter by employee_id if provided
    const employeeId = query.employee_id || query.employeeId;
    if (employeeId) {
      queryBuilder.where('leave_request.employeeId = :employeeId', { employeeId });
    }

    // Filter by status if provided
    if (query.status) {
      const whereCondition = employeeId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('leave_request.status = :status', { status: query.status });
    }

    // Handle sorting
    if (query.sort) {
      const sortField = query.sort.startsWith('-') ? query.sort.substring(1) : query.sort;
      const order = query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap: Record<string, string> = {
        'created_date': 'createdAt',
        'created_at': 'createdAt',
        'start_date': 'startDate',
        'end_date': 'endDate',
      };
      const dbField = fieldMap[sortField] || sortField;
      queryBuilder.orderBy(`leave_request.${dbField}`, order);
    } else {
      queryBuilder.orderBy('leave_request.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id },
    });

    if (!leaveRequest) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    return leaveRequest;
  }

  async update(id: string, updateLeaveRequestDto: UpdateLeaveRequestDto): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id);
    
    const updateData: any = { ...updateLeaveRequestDto };
    if (updateLeaveRequestDto.startDate) {
      updateData.startDate = new Date(updateLeaveRequestDto.startDate);
    }
    if (updateLeaveRequestDto.endDate) {
      updateData.endDate = new Date(updateLeaveRequestDto.endDate);
    }

    Object.assign(leaveRequest, updateData);
    return await this.leaveRequestRepository.save(leaveRequest);
  }

  async remove(id: string): Promise<void> {
    const leaveRequest = await this.findOne(id);
    await this.leaveRequestRepository.remove(leaveRequest);
  }
}

