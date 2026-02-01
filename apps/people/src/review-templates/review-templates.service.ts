import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewTemplate } from './entities/review-template.entity';
import { CreateReviewTemplateDto } from './dto/create-review-template.dto';

@Injectable()
export class ReviewTemplatesService {
  constructor(
    @InjectRepository(ReviewTemplate)
    private readonly reviewTemplateRepository: Repository<ReviewTemplate>,
  ) {}

  async findAll(): Promise<ReviewTemplate[]> {
    return await this.reviewTemplateRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(createReviewTemplateDto: CreateReviewTemplateDto): Promise<ReviewTemplate> {
    const reviewTemplate = this.reviewTemplateRepository.create({
      ...createReviewTemplateDto,
    });

    return await this.reviewTemplateRepository.save(reviewTemplate);
  }
}
