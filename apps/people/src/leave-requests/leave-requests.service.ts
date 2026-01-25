import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequest, LeaveRequestStatus } from './entities/leave-request.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
  ) {}

  async create(createLeaveRequestDto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const leaveRequest = this.leaveRequestRepository.create({
      ...createLeaveRequestDto,
      employeeId: createLeaveRequestDto.employeeId || null,
      startDate: new Date(createLeaveRequestDto.startDate),
      endDate: new Date(createLeaveRequestDto.endDate),
      status: createLeaveRequestDto.status || LeaveRequestStatus.PENDING,
    });

    return await this.leaveRequestRepository.save(leaveRequest);
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

