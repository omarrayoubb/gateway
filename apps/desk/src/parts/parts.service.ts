import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Part } from './entities/part.entity';

@Injectable()
export class PartsService {
  constructor(
    @InjectRepository(Part)
    private readonly partRepository: Repository<Part>,
  ) {}

  async findAll(): Promise<Part[]> {
    return await this.partRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }
}

