import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { UpdateKnowledgeBaseDto } from './dto/update-knowledge-base.dto';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @InjectRepository(KnowledgeBase)
    private readonly knowledgeBaseRepository: Repository<KnowledgeBase>,
  ) {}

  private transformToResponse(article: KnowledgeBase): any {
    return {
      id: article.id,
      title: article.title,
      summary: article.summary,
      content: article.content,
      category: article.category,
      tags: article.tags,
      status: article.status,
      view_count: article.view_count,
      helpful_count: article.helpful_count,
      created_date: article.createdAt,
      last_updated: article.updatedAt,
    };
  }

  async findAll(
    sort?: string,
    category?: string,
    status?: string,
  ): Promise<any[]> {
    const queryBuilder = this.knowledgeBaseRepository.createQueryBuilder('kb');

    if (category) {
      queryBuilder.andWhere('kb.category = :category', { category });
    }

    if (status) {
      queryBuilder.andWhere('kb.status = :status', { status });
    }

    if (sort) {
      const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';
      let sortField = sort.replace(/^-/, '');
      
      // Map API field names to entity field names
      const fieldMapping: Record<string, string> = {
        created_date: 'createdAt',
        last_updated: 'updatedAt',
        view_count: 'view_count',
        helpful_count: 'helpful_count',
      };
      
      sortField = fieldMapping[sortField] || sortField;
      queryBuilder.orderBy(`kb.${sortField}`, sortOrder);
    } else {
      queryBuilder.orderBy('kb.createdAt', 'DESC');
    }

    const articles = await queryBuilder.getMany();
    return articles.map((article) => this.transformToResponse(article));
  }

  async findOne(id: string): Promise<any> {
    const article = await this.knowledgeBaseRepository.findOne({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return this.transformToResponse(article);
  }

  async create(
    createKnowledgeBaseDto: CreateKnowledgeBaseDto,
  ): Promise<any> {
    const article = this.knowledgeBaseRepository.create({
      ...createKnowledgeBaseDto,
      status: createKnowledgeBaseDto.status || 'Draft',
      view_count: 0,
      helpful_count: 0,
    });

    const savedArticle = await this.knowledgeBaseRepository.save(article);
    return this.transformToResponse(savedArticle);
  }

  async update(
    id: string,
    updateKnowledgeBaseDto: UpdateKnowledgeBaseDto,
  ): Promise<any> {
    const article = await this.knowledgeBaseRepository.findOne({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    // Handle last_updated if provided
    const updateData: any = { ...updateKnowledgeBaseDto };
    if (updateData.last_updated) {
      updateData.updatedAt = new Date(updateData.last_updated);
      delete updateData.last_updated;
    }

    Object.assign(article, updateData);
    const updatedArticle = await this.knowledgeBaseRepository.save(article);
    return this.transformToResponse(updatedArticle);
  }

  async remove(id: string): Promise<void> {
    const article = await this.knowledgeBaseRepository.findOne({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    await this.knowledgeBaseRepository.remove(article);
  }
}

