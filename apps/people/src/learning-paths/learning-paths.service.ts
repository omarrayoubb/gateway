import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningPath } from './entities/learning-path.entity';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';

@Injectable()
export class LearningPathsService {
  constructor(
    @InjectRepository(LearningPath)
    private readonly learningPathRepository: Repository<LearningPath>,
  ) {}

  async findAll(): Promise<LearningPath[]> {
    return await this.learningPathRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(createLearningPathDto: CreateLearningPathDto): Promise<LearningPath> {
    const learningPath = this.learningPathRepository.create({
      ...createLearningPathDto,
    });

    return await this.learningPathRepository.save(learningPath);
  }
}
