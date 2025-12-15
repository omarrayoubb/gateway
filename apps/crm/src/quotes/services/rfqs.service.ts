import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RFQ } from '../entities/rfq.entity';
import { RFQLineItem } from '../entities/rfq-line-item.entity';
import { CreateRFQDto } from '../dto/create-rfq.dto';
import { UpdateRFQDto } from '../dto/update-rfq.dto';
import { PaginationQueryDto } from '../../leads/dto/pagination.dto';
import { User } from '../../users/users.entity';

export interface PaginatedRFQsResult {
  data: RFQ[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class RFQsService {
  constructor(
    @InjectRepository(RFQ)
    private readonly rfqRepository: Repository<RFQ>,
    @InjectRepository(RFQLineItem)
    private readonly rfqLineItemRepository: Repository<RFQLineItem>,
  ) {}

  async create(createRFQDto: CreateRFQDto, currentUser: Omit<User, 'password'>): Promise<RFQ> {
    // Validate that either contactId or leadId is provided (not both)
    if (!createRFQDto.contactId && !createRFQDto.leadId) {
      throw new ConflictException('Either contactId or leadId must be provided');
    }
    if (createRFQDto.contactId && createRFQDto.leadId) {
      throw new ConflictException('Cannot provide both contactId and leadId. Please provide only one.');
    }
    
    const rfqData: any = {
      ...createRFQDto,
      requestedBy: currentUser.email, // RFQ Owner - auto-set from current user
      status: createRFQDto.status || 'SUBMITTED', // Default to SUBMITTED if not provided
      approvalStatus: 'Not Required',
      requiresApproval: false,
    };

    const rfq = this.rfqRepository.create(rfqData);
    const savedRFQ = await this.rfqRepository.save(rfq as unknown as RFQ);

    // Save line items
    if (createRFQDto.lineItems && createRFQDto.lineItems.length > 0) {
      const lineItems = createRFQDto.lineItems.map(item =>
        this.rfqLineItemRepository.create({
          ...item,
          rfqId: savedRFQ.id,
        })
      );
      await this.rfqLineItemRepository.save(lineItems);
    }

    return this.findOne(savedRFQ.id);
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedRFQsResult> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.rfqRepository.findAndCount({
      relations: ['account', 'contact', 'lead', 'lineItems'],
      take: limit,
      skip: skip,
      order: { createdDate: 'DESC' },
    });

    const lastPage = Math.ceil(total / limit);

    return { data, total, page, lastPage };
  }

  async findOne(id: string): Promise<RFQ> {
    const rfq = await this.rfqRepository.findOne({
      where: { id },
      relations: ['account', 'contact', 'lead', 'lineItems'],
    });

    if (!rfq) {
      throw new NotFoundException(`RFQ with ID ${id} not found`);
    }

    return rfq;
  }

  async update(id: string, updateRFQDto: UpdateRFQDto): Promise<RFQ> {
    const rfq = await this.rfqRepository.preload({
      id,
      ...updateRFQDto,
    });

    if (!rfq) {
      throw new NotFoundException(`RFQ with ID ${id} not found`);
    }

    // Update line items if provided
    if (updateRFQDto.lineItems) {
      // Delete existing line items
      await this.rfqLineItemRepository.delete({ rfqId: id });
      
      // Create new line items
      const lineItems = updateRFQDto.lineItems.map(item =>
        this.rfqLineItemRepository.create({
          ...item,
          rfqId: id,
        })
      );
      await this.rfqLineItemRepository.save(lineItems);
    }

    await this.rfqRepository.save(rfq);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const rfq = await this.findOne(id);
    await this.rfqRepository.remove(rfq);
  }
}

