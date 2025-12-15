import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manufacturer } from '../entities/manufacturer.entity';

@Injectable()
export class ManufacturersService {
  constructor(
    @InjectRepository(Manufacturer)
    private readonly manufacturerRepository: Repository<Manufacturer>,
  ) {}

  async findAll(): Promise<Manufacturer[]> {
    return this.manufacturerRepository.find({
      where: { isActive: true },
      order: { companyName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Manufacturer> {
    const manufacturer = await this.manufacturerRepository.findOne({
      where: { id, isActive: true },
    });

    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer with ID ${id} not found`);
    }

    return manufacturer;
  }
}

