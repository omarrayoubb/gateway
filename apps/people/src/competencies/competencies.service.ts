import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competency } from './entities/competency.entity';
import { CreateCompetencyDto } from './dto/create-competency.dto';

@Injectable()
export class CompetenciesService {
  constructor(
    @InjectRepository(Competency)
    private readonly competencyRepository: Repository<Competency>,
  ) {}

  async findAll(): Promise<Competency[]> {
    return await this.competencyRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(createCompetencyDto: CreateCompetencyDto): Promise<Competency> {
    const competency = this.competencyRepository.create({
      ...createCompetencyDto,
    });

    return await this.competencyRepository.save(competency);
  }
}
