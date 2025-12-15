import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductLine } from '../entities/product-line.entity';

@Injectable()
export class ProductLinesService {
  constructor(
    @InjectRepository(ProductLine)
    private readonly productLineRepository: Repository<ProductLine>,
  ) {}

  async findAll(): Promise<ProductLine[]> {
    return this.productLineRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ProductLine> {
    const productLine = await this.productLineRepository.findOne({
      where: { id },
    });

    if (!productLine) {
      throw new NotFoundException(`Product Line with ID ${id} not found`);
    }

    return productLine;
  }
}

