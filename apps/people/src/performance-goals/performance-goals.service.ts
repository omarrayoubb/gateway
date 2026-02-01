import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceGoal } from './entities/performance-goal.entity';
import { CreatePerformanceGoalDto } from './dto/create-performance-goal.dto';

@Injectable()
export class PerformanceGoalsService {
  constructor(
    @InjectRepository(PerformanceGoal)
    private readonly performanceGoalRepository: Repository<PerformanceGoal>,
  ) {}

  async findAll(): Promise<PerformanceGoal[]> {
    return await this.performanceGoalRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(createPerformanceGoalDto: CreatePerformanceGoalDto): Promise<PerformanceGoal> {
    const performanceGoal = this.performanceGoalRepository.create({
      ...createPerformanceGoalDto,
      targetDate: createPerformanceGoalDto.targetDate 
        ? new Date(createPerformanceGoalDto.targetDate) 
        : null,
    });

    return await this.performanceGoalRepository.save(performanceGoal);
  }
}
