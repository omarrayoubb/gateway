import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { UpdateKnowledgeBaseDto } from './dto/update-knowledge-base.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateKnowledgeBaseDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';
import { KnowledgeBaseResponseDto } from './dto/knowledge-base-response.dto';

export interface PaginatedKnowledgeBasesResult {
  data: KnowledgeBaseResponseDto[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @InjectRepository(KnowledgeBase)
    private readonly knowledgeBaseRepository: Repository<KnowledgeBase>,
  ) {}

  async create(createKnowledgeBaseDto: CreateKnowledgeBaseDto, currentUser: { id: string; name: string; email: string }): Promise<KnowledgeBaseResponseDto> {
    const knowledgeBase = this.knowledgeBaseRepository.create({
      ...createKnowledgeBaseDto,
      status: createKnowledgeBaseDto.status || 'draft',
    });
    const savedKnowledgeBase = await this.knowledgeBaseRepository.save(knowledgeBase);
    return this._transformKnowledgeBaseToResponse(savedKnowledgeBase);
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedKnowledgeBasesResult> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [knowledgeBases, total] = await this.knowledgeBaseRepository.findAndCount({
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    const lastPage = Math.ceil(total / limit);
    const transformedData = knowledgeBases.map((kb) => this._transformKnowledgeBaseToResponse(kb));

    return {
      data: transformedData,
      total,
      page,
      lastPage,
    };
  }

  async findOne(id: string): Promise<KnowledgeBaseResponseDto> {
    const knowledgeBase = await this.knowledgeBaseRepository.findOne({
      where: { id },
    });

    if (!knowledgeBase) {
      throw new NotFoundException(`Knowledge Base article with ID ${id} not found`);
    }

    return this._transformKnowledgeBaseToResponse(knowledgeBase);
  }

  async update(
    id: string,
    updateKnowledgeBaseDto: UpdateKnowledgeBaseDto,
    currentUser: { id: string; name: string; email: string },
  ): Promise<KnowledgeBaseResponseDto> {
    const knowledgeBase = await this.knowledgeBaseRepository.findOne({
      where: { id },
    });

    if (!knowledgeBase) {
      throw new NotFoundException(`Knowledge Base article with ID ${id} not found`);
    }

    Object.assign(knowledgeBase, updateKnowledgeBaseDto);
    const savedKnowledgeBase = await this.knowledgeBaseRepository.save(knowledgeBase);
    return this._transformKnowledgeBaseToResponse(savedKnowledgeBase);
  }

  async remove(id: string): Promise<void> {
    const knowledgeBase = await this.knowledgeBaseRepository.findOneBy({ id });
    if (!knowledgeBase) {
      throw new NotFoundException(`Knowledge Base article with ID ${id} not found`);
    }
    await this.knowledgeBaseRepository.remove(knowledgeBase);
  }

  async bulkRemove(bulkDeleteDto: BulkDeleteDto): Promise<BulkDeleteResponse> {
    const { ids } = bulkDeleteDto;
    const failedIds: Array<{ id: string; error: string }> = [];
    let deletedCount = 0;

    const knowledgeBases = await this.knowledgeBaseRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(knowledgeBases.map((kb) => kb.id));

    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedIds.push({ id, error: 'Knowledge Base article not found' });
      }
    }

    if (knowledgeBases.length > 0) {
      await this.knowledgeBaseRepository.remove(knowledgeBases);
      deletedCount = knowledgeBases.length;
    }

    return {
      deletedCount,
      ...(failedIds.length > 0 && { failedIds }),
    };
  }

  async bulkUpdate(bulkUpdateDto: BulkUpdateKnowledgeBaseDto, currentUser: { id: string; name: string; email: string }): Promise<BulkUpdateResponse> {
    const { ids, updateFields } = bulkUpdateDto;
    const failedItems: Array<{ id: string; error: string }> = [];
    let updatedCount = 0;

    const knowledgeBases = await this.knowledgeBaseRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(knowledgeBases.map((kb) => kb.id));

    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedItems.push({ id, error: 'Knowledge Base article not found' });
      }
    }

    for (const knowledgeBase of knowledgeBases) {
      if (failedItems.some((f) => f.id === knowledgeBase.id)) {
        continue;
      }

      try {
        Object.assign(knowledgeBase, updateFields);
        await this.knowledgeBaseRepository.save(knowledgeBase);
        updatedCount++;
      } catch (error) {
        failedItems.push({
          id: knowledgeBase.id,
          error: error.message || 'Failed to update knowledge base article',
        });
      }
    }

    return {
      updatedCount,
      ...(failedItems.length > 0 && { failedItems }),
    };
  }

  private _transformKnowledgeBaseToResponse(knowledgeBase: KnowledgeBase): KnowledgeBaseResponseDto {
    return {
      id: knowledgeBase.id,
      articleTitle: knowledgeBase.articleTitle,
      category: knowledgeBase.category,
      status: knowledgeBase.status,
      content: knowledgeBase.content,
      author: knowledgeBase.author,
      createdAt: knowledgeBase.createdAt,
      updatedAt: knowledgeBase.updatedAt,
    };
  }
}

