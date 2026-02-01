import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceReview } from './entities/performance-review.entity';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';

@Injectable()
export class PerformanceReviewsService {
  constructor(
    @InjectRepository(PerformanceReview)
    private readonly performanceReviewRepository: Repository<PerformanceReview>,
  ) {}

  async create(createPerformanceReviewDto: CreatePerformanceReviewDto): Promise<PerformanceReview> {
    const performanceReview = this.performanceReviewRepository.create({
      ...createPerformanceReviewDto,
      reviewDate: new Date(createPerformanceReviewDto.reviewDate),
    });

    return await this.performanceReviewRepository.save(performanceReview);
  }

  async findAll(query: { sort?: string }): Promise<PerformanceReview[]> {
    const queryBuilder = this.performanceReviewRepository.createQueryBuilder('performance_review');

    // Handle sorting
    if (query.sort) {
      const sortField = query.sort.startsWith('-') ? query.sort.substring(1) : query.sort;
      const order = query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap: Record<string, string> = {
        'review_date': 'reviewDate',
        'created_at': 'createdAt',
      };
      const dbField = fieldMap[sortField] || sortField;
      queryBuilder.orderBy(`performance_review.${dbField}`, order);
    } else {
      queryBuilder.orderBy('performance_review.reviewDate', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<PerformanceReview> {
    const performanceReview = await this.performanceReviewRepository.findOne({
      where: { id },
    });

    if (!performanceReview) {
      throw new NotFoundException(`Performance review with ID ${id} not found`);
    }

    return performanceReview;
  }

  async update(id: string, updateData: Partial<PerformanceReview>): Promise<PerformanceReview> {
    const performanceReview = await this.findOne(id);
    
    if (updateData.reviewDate && typeof updateData.reviewDate === 'string') {
      updateData.reviewDate = new Date(updateData.reviewDate) as any;
    }

    Object.assign(performanceReview, updateData);
    return await this.performanceReviewRepository.save(performanceReview);
  }

  async remove(id: string): Promise<void> {
    const performanceReview = await this.findOne(id);
    await this.performanceReviewRepository.remove(performanceReview);
  }
}
