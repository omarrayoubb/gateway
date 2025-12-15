import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductAlert } from './entities/product-alert.entity';
import { UpdateProductAlertDto } from './dto/update-product-alert.dto';
import { ProductAlertPaginationDto } from './dto/pagination.dto';

export interface PaginatedProductAlertsResult {
  data: ProductAlert[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable()
export class ProductAlertsService {
  constructor(
    @InjectRepository(ProductAlert)
    private readonly alertRepository: Repository<ProductAlert>,
  ) {}

  async findAll(paginationQuery: ProductAlertPaginationDto): Promise<PaginatedProductAlertsResult> {
    const { page, limit, productId, warehouseId, status, severity } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.alertRepository.createQueryBuilder('alert')
      .leftJoinAndSelect('alert.product', 'product');

    if (productId) {
      queryBuilder.where('alert.productId = :productId', { productId });
    }

    if (warehouseId) {
      queryBuilder.andWhere('alert.warehouseId = :warehouseId', { warehouseId });
    }

    if (status) {
      queryBuilder.andWhere('alert.status = :status', { status });
    }

    if (severity) {
      queryBuilder.andWhere('alert.severity = :severity', { severity });
    }

    const [data, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .orderBy('alert.createdAt', 'DESC')
      .getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
    };
  }

  async findOne(id: string): Promise<ProductAlert> {
    const alert = await this.alertRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!alert) {
      throw new NotFoundException(`Product alert with ID ${id} not found`);
    }

    return alert;
  }

  async update(id: string, updateAlertDto: UpdateProductAlertDto): Promise<ProductAlert> {
    const alert = await this.findOne(id);
    
    if (updateAlertDto.status) {
      alert.status = updateAlertDto.status;
    }

    if (updateAlertDto.acknowledgedAt) {
      alert.acknowledgedAt = new Date(updateAlertDto.acknowledgedAt);
    }

    if (updateAlertDto.resolvedAt) {
      alert.resolvedAt = new Date(updateAlertDto.resolvedAt);
    }

    return await this.alertRepository.save(alert);
  }

  async remove(id: string): Promise<void> {
    const alert = await this.findOne(id);
    await this.alertRepository.remove(alert);
  }
}

