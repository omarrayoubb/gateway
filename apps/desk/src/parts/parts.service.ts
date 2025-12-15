import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Part } from './entities/part.entity';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdatePartDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';
import { PartResponseDto } from './dto/part-response.dto';

export interface PaginatedPartsResult {
  data: PartResponseDto[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class PartsService {
  constructor(
    @InjectRepository(Part)
    private readonly partRepository: Repository<Part>,
  ) {}

  async create(createPartDto: CreatePartDto, currentUser: { id: string; name: string; email: string }): Promise<PartResponseDto> {
    const part = this.partRepository.create(createPartDto);
    const savedPart = await this.partRepository.save(part);
    return this._transformPartToResponse(savedPart);
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedPartsResult> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.partRepository.findAndCount({
      take: limit,
      skip: skip,
      order: {
        name: 'ASC',
      },
    });

    const lastPage = Math.ceil(total / limit);
    const transformedData = data.map((part) => this._transformPartToResponse(part));

    return {
      data: transformedData,
      total,
      page,
      lastPage,
    };
  }

  async findOne(id: string): Promise<PartResponseDto> {
    const part = await this.partRepository.findOne({
      where: { id },
    });

    if (!part) {
      throw new NotFoundException(`Part with ID ${id} not found`);
    }

    return this._transformPartToResponse(part);
  }

  async update(id: string, updatePartDto: UpdatePartDto, currentUser: { id: string; name: string; email: string }): Promise<PartResponseDto> {
    const part = await this.partRepository.findOne({
      where: { id },
    });

    if (!part) {
      throw new NotFoundException(`Part with ID ${id} not found`);
    }

    Object.assign(part, updatePartDto);
    const savedPart = await this.partRepository.save(part);
    return this._transformPartToResponse(savedPart);
  }

  async remove(id: string): Promise<void> {
    const part = await this.partRepository.findOneBy({ id });
    if (!part) {
      throw new NotFoundException(`Part with ID ${id} not found`);
    }
    await this.partRepository.remove(part);
  }

  async bulkRemove(bulkDeleteDto: BulkDeleteDto): Promise<BulkDeleteResponse> {
    const { ids } = bulkDeleteDto;
    const failedIds: Array<{ id: string; error: string }> = [];
    let deletedCount = 0;

    const parts = await this.partRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(parts.map((p) => p.id));

    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedIds.push({ id, error: 'Part not found' });
      }
    }

    if (parts.length > 0) {
      await this.partRepository.remove(parts);
      deletedCount = parts.length;
    }

    return {
      deletedCount,
      ...(failedIds.length > 0 && { failedIds }),
    };
  }

  async bulkUpdate(bulkUpdateDto: BulkUpdatePartDto, currentUser: { id: string; name: string; email: string }): Promise<BulkUpdateResponse> {
    const { ids, updateFields } = bulkUpdateDto;
    const failedItems: Array<{ id: string; error: string }> = [];
    let updatedCount = 0;

    const parts = await this.partRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(parts.map((p) => p.id));

    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedItems.push({ id, error: 'Part not found' });
      }
    }

    for (const part of parts) {
      if (failedItems.some((f) => f.id === part.id)) {
        continue;
      }

      try {
        Object.assign(part, updateFields);
        await this.partRepository.save(part);
        updatedCount++;
      } catch (error) {
        failedItems.push({
          id: part.id,
          error: error.message || 'Failed to update part',
        });
      }
    }

    return {
      updatedCount,
      ...(failedItems.length > 0 && { failedItems }),
    };
  }

  private _transformPartToResponse(part: Part): PartResponseDto {
    return {
      id: part.id,
      name: part.name,
      price: part.price,
      createdAt: part.createdAt,
      updatedAt: part.updatedAt,
    };
  }
}

