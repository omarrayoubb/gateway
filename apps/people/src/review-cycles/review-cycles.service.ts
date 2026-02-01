import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewCycle } from './entities/review-cycle.entity';
import { CreateReviewCycleDto } from './dto/create-review-cycle.dto';

@Injectable()
export class ReviewCyclesService {
  constructor(
    @InjectRepository(ReviewCycle)
    private readonly reviewCycleRepository: Repository<ReviewCycle>,
  ) {}

  async findAll(): Promise<ReviewCycle[]> {
    return await this.reviewCycleRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(createReviewCycleDto: CreateReviewCycleDto): Promise<ReviewCycle> {
    const reviewCycle = this.reviewCycleRepository.create({
      ...createReviewCycleDto,
      startDate: new Date(createReviewCycleDto.startDate),
      endDate: new Date(createReviewCycleDto.endDate),
    });

    return await this.reviewCycleRepository.save(reviewCycle);
  }
}
