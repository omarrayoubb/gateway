import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareerPath } from './entities/career-path.entity';
import { CreateCareerPathDto } from './dto/create-career-path.dto';

@Injectable()
export class CareerPathsService {
  constructor(
    @InjectRepository(CareerPath)
    private readonly careerPathRepository: Repository<CareerPath>,
  ) {}

  async findAll(): Promise<CareerPath[]> {
    return await this.careerPathRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(createCareerPathDto: CreateCareerPathDto): Promise<CareerPath> {
    const careerPath = this.careerPathRepository.create({
      ...createCareerPathDto,
    });

    return await this.careerPathRepository.save(careerPath);
  }
}
