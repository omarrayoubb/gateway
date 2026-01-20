import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Liability, LiabilityType, LiabilityStatus } from './entities/liability.entity';
import { CreateLiabilityDto } from './dto/create-liability.dto';
import { UpdateLiabilityDto } from './dto/update-liability.dto';
import { LiabilityPaginationDto } from './dto/pagination.dto';
import { Account } from '../accounts/entities/account.entity';

@Injectable()
export class LiabilitiesService {
  constructor(
    @InjectRepository(Liability)
    private readonly liabilityRepository: Repository<Liability>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create(createDto: CreateLiabilityDto): Promise<Liability> {
    const organizationId = createDto.organization_id || null;

    // Check for duplicate liability code
    const existing = await this.liabilityRepository.findOne({
      where: {
        liabilityCode: createDto.liability_code,
        organizationId: organizationId === null ? IsNull() : organizationId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Liability with code ${createDto.liability_code} already exists`,
      );
    }

    // Validate account
    const account = await this.accountRepository.findOne({
      where: { id: createDto.account_id },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${createDto.account_id} not found`);
    }

    const liability = this.liabilityRepository.create({
      organizationId,
      liabilityCode: createDto.liability_code,
      liabilityName: createDto.liability_name,
      liabilityType: createDto.liability_type,
      amount: createDto.amount || 0,
      currency: createDto.currency || 'USD',
      dueDate: createDto.due_date ? new Date(createDto.due_date) : null,
      interestRate: createDto.interest_rate || 0,
      status: LiabilityStatus.ACTIVE,
      accountId: createDto.account_id,
    });

    return await this.liabilityRepository.save(liability);
  }

  async findAll(paginationDto: LiabilityPaginationDto): Promise<Liability[]> {
    const where: any = {};

    if (paginationDto.liability_type) {
      where.liabilityType = paginationDto.liability_type;
    }

    const queryBuilder = this.liabilityRepository.createQueryBuilder('liability').where(where);

    if (paginationDto.sort) {
      let sortField = paginationDto.sort.trim();
      let sortOrder: 'ASC' | 'DESC' = 'ASC';

      if (sortField.startsWith('-')) {
        sortField = sortField.substring(1).trim();
        sortOrder = 'DESC';
      } else if (sortField.includes(':')) {
        const [field, order] = sortField.split(':');
        sortField = field.trim();
        sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      }

      const mappedField = this.mapSortField(sortField);
      const validSortFields = ['liabilityCode', 'liabilityName', 'liabilityType', 'amount', 'dueDate', 'status', 'createdAt', 'updatedAt'];
      if (validSortFields.includes(mappedField)) {
        queryBuilder.orderBy(`liability.${mappedField}`, sortOrder);
      } else {
        queryBuilder.orderBy('liability.createdAt', 'DESC');
      }
    } else {
      queryBuilder.orderBy('liability.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Liability> {
    const liability = await this.liabilityRepository.findOne({
      where: { id },
      relations: ['account'],
    });

    if (!liability) {
      throw new NotFoundException(`Liability with ID ${id} not found`);
    }

    return liability;
  }

  async update(id: string, updateDto: UpdateLiabilityDto): Promise<Liability> {
    const liability = await this.findOne(id);

    if (updateDto.liability_code && updateDto.liability_code !== liability.liabilityCode) {
      const existing = await this.liabilityRepository.findOne({
        where: { liabilityCode: updateDto.liability_code },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Liability with code ${updateDto.liability_code} already exists`,
        );
      }
    }

    Object.assign(liability, {
      ...(updateDto.liability_code && { liabilityCode: updateDto.liability_code }),
      ...(updateDto.liability_name && { liabilityName: updateDto.liability_name }),
      ...(updateDto.liability_type && { liabilityType: updateDto.liability_type }),
      ...(updateDto.amount !== undefined && { amount: updateDto.amount }),
      ...(updateDto.currency && { currency: updateDto.currency }),
      ...(updateDto.due_date && { dueDate: new Date(updateDto.due_date) }),
      ...(updateDto.interest_rate !== undefined && { interestRate: updateDto.interest_rate }),
      ...(updateDto.account_id && { accountId: updateDto.account_id }),
      ...(updateDto.status && { status: updateDto.status }),
    });

    return await this.liabilityRepository.save(liability);
  }

  async remove(id: string): Promise<void> {
    const liability = await this.findOne(id);
    await this.liabilityRepository.remove(liability);
  }

  async findByType(type: LiabilityType): Promise<Liability[]> {
    return await this.liabilityRepository.find({
      where: { liabilityType: type },
      relations: ['account'],
      order: { createdAt: 'DESC' },
    });
  }

  private mapSortField(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'liability_code': 'liabilityCode',
      'liability_name': 'liabilityName',
      'liability_type': 'liabilityType',
      'amount': 'amount',
      'due_date': 'dueDate',
      'created_at': 'createdAt',
    };

    return fieldMap[field] || field;
  }
}

