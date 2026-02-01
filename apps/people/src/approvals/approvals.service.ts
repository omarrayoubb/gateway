import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Approval, ApprovalStatus, RequestType } from './entities/approval.entity';
import { ApprovalHistory, ApprovalAction } from './entities/approval-history.entity';
import { Employee } from '../people/entities/person.entity';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
@Injectable()
export class ApprovalsService {
  constructor(
    @InjectRepository(Approval)
    private readonly approvalRepository: Repository<Approval>,
    @InjectRepository(ApprovalHistory)
    private readonly approvalHistoryRepository: Repository<ApprovalHistory>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createApprovalDto: CreateApprovalDto): Promise<Approval> {
    const requester = await this.employeeRepository.findOne({
      where: { id: createApprovalDto.requesterId },
    });

    if (!requester) {
      throw new NotFoundException('Requester not found');
    }

    // Generate approval chain if not provided
    let approvalChain = createApprovalDto.approvalChain;
    if (!approvalChain || approvalChain.length === 0) {
      approvalChain = await this.generateApprovalChain(createApprovalDto.requesterId, createApprovalDto.requestType);
    }

    if (approvalChain.length === 0) {
      // Auto-approve if no approval chain
      const approval = this.approvalRepository.create({
        ...createApprovalDto,
        approvalChain: [],
        currentLevel: 0,
        totalLevels: 0,
        status: ApprovalStatus.APPROVED,
        approvedAt: new Date(),
      });
      return await this.approvalRepository.save(approval);
    }

    const approval = this.approvalRepository.create({
      ...createApprovalDto,
      approvalChain,
      currentLevel: 0,
      totalLevels: approvalChain.length,
      status: ApprovalStatus.SUBMITTED,
      currentApproverId: approvalChain[0],
    });

    const savedApproval = await this.approvalRepository.save(approval);

    // TODO: Create notification for first approver

    return savedApproval;
  }

  async findAll(query: {
    status?: string;
    requesterId?: string;
    approverId?: string;
    requestType?: string;
  }): Promise<Approval[]> {
    const queryBuilder = this.approvalRepository.createQueryBuilder('approval');

    if (query.status) {
      queryBuilder.where('approval.status = :status', { status: query.status });
    }

    if (query.requesterId) {
      const whereCondition = query.status ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('approval.requesterId = :requesterId', { requesterId: query.requesterId });
    }

    if (query.approverId) {
      const whereCondition = (query.status || query.requesterId) ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('approval.currentApproverId = :approverId', { approverId: query.approverId });
    }

    if (query.requestType) {
      const whereCondition = (query.status || query.requesterId || query.approverId) ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('approval.requestType = :requestType', { requestType: query.requestType });
    }

    queryBuilder.orderBy('approval.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Approval> {
    const approval = await this.approvalRepository.findOne({
      where: { id },
    });

    if (!approval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    return approval;
  }

  async approve(id: string, approverId: string, approveRequestDto: ApproveRequestDto): Promise<Approval> {
    const approval = await this.findOne(id);

    if (approval.status !== ApprovalStatus.PENDING && approval.status !== ApprovalStatus.SUBMITTED) {
      throw new BadRequestException('Approval is not in a state that can be approved');
    }

    if (approval.currentApproverId !== approverId) {
      throw new BadRequestException('You are not the current approver');
    }

    // Record approval in history
    const history = this.approvalHistoryRepository.create({
      approvalId: approval.id,
      approverId,
      action: ApprovalAction.APPROVED,
      comments: approveRequestDto.comments || null,
    });
    await this.approvalHistoryRepository.save(history);

    // Move to next approver or complete
    const nextLevel = approval.currentLevel + 1;
    if (nextLevel >= approval.totalLevels) {
      // All approvals complete
      approval.status = ApprovalStatus.APPROVED;
      approval.approvedAt = new Date();
      approval.currentApproverId = null;
    } else {
      // Move to next approver
      approval.currentLevel = nextLevel;
      approval.currentApproverId = approval.approvalChain![nextLevel];
      approval.status = ApprovalStatus.PENDING;
      // TODO: Create notification for next approver
    }

    return await this.approvalRepository.save(approval);
  }

  async reject(id: string, approverId: string, rejectRequestDto: RejectRequestDto): Promise<Approval> {
    const approval = await this.findOne(id);

    if (approval.status !== ApprovalStatus.PENDING && approval.status !== ApprovalStatus.SUBMITTED) {
      throw new BadRequestException('Approval is not in a state that can be rejected');
    }

    if (approval.currentApproverId !== approverId) {
      throw new BadRequestException('You are not the current approver');
    }

    // Record rejection in history
    const history = this.approvalHistoryRepository.create({
      approvalId: approval.id,
      approverId,
      action: ApprovalAction.REJECTED,
      comments: rejectRequestDto.rejectionReason,
    });
    await this.approvalHistoryRepository.save(history);

    approval.status = ApprovalStatus.REJECTED;
    approval.rejectionReason = rejectRequestDto.rejectionReason;
    approval.rejectedAt = new Date();
    approval.currentApproverId = null;

    // TODO: Create notification for requester

    return await this.approvalRepository.save(approval);
  }

  async getHistory(approvalId: string): Promise<ApprovalHistory[]> {
    return await this.approvalHistoryRepository.find({
      where: { approvalId },
      order: { createdAt: 'ASC' },
    });
  }

  private async generateApprovalChain(requesterId: string, requestType: RequestType): Promise<string[]> {
    const chain: string[] = [];
    const requester = await this.employeeRepository.findOne({
      where: { id: requesterId },
    });

    if (!requester) {
      return chain;
    }

    // Get manager chain
    let currentEmployee = requester;
    while (currentEmployee.managerId) {
      const manager = await this.employeeRepository.findOne({
        where: { id: currentEmployee.managerId },
      });

      if (!manager) {
        break;
      }

      chain.push(manager.id);
      currentEmployee = manager;
    }

    // TODO: Add HR approval if required based on request type

    return chain;
  }
}
