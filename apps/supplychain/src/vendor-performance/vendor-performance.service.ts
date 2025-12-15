import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorPerformance } from './entities/vendor-performance.entity';
import { CreateVendorPerformanceDto } from './dto/create-vendor-performance.dto';
import { UpdateVendorPerformanceDto } from './dto/update-vendor-performance.dto';
import { VendorPerformancePaginationDto } from './dto/pagination.dto';
import { Vendor } from '../vendors/entities/vendor.entity';

export interface PaginatedVendorPerformanceResult {
  data: VendorPerformance[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable()
export class VendorPerformanceService {
  constructor(
    @InjectRepository(VendorPerformance)
    private performanceRepository: Repository<VendorPerformance>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
  ) {}

  async create(createVendorPerformanceDto: CreateVendorPerformanceDto): Promise<VendorPerformance> {
    // Validate vendor exists
    const vendor = await this.vendorRepository.findOne({
      where: { id: createVendorPerformanceDto.vendorId },
    });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${createVendorPerformanceDto.vendorId} not found`);
    }

    const performance = this.performanceRepository.create({
      ...createVendorPerformanceDto,
      periodStart: new Date(createVendorPerformanceDto.periodStart),
      periodEnd: new Date(createVendorPerformanceDto.periodEnd),
    });
    return await this.performanceRepository.save(performance);
  }

  async findAll(paginationQuery: VendorPerformancePaginationDto): Promise<PaginatedVendorPerformanceResult> {
    const { page = 1, limit = 10, vendorId, sort } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.performanceRepository
      .createQueryBuilder('performance')
      .leftJoinAndSelect('performance.vendor', 'vendor');

    if (vendorId) {
      queryBuilder.where('performance.vendorId = :vendorId', { vendorId });
    }

    // Handle sorting
    if (sort) {
      const [field, order] = sort.split(':');
      queryBuilder.orderBy(`performance.${field}`, order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');
    } else {
      queryBuilder.orderBy('performance.periodEnd', 'DESC');
    }

    const [data, total] = await queryBuilder
      .take(limit)
      .skip(skip)
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

  async findOne(id: string): Promise<VendorPerformance> {
    const performance = await this.performanceRepository.findOne({
      where: { id },
      relations: ['vendor'],
    });
    if (!performance) {
      throw new NotFoundException(`Vendor performance with ID ${id} not found`);
    }
    return performance;
  }

  async update(id: string, updateVendorPerformanceDto: UpdateVendorPerformanceDto): Promise<VendorPerformance> {
    const performance = await this.findOne(id);

    // Validate vendor if being updated
    if (updateVendorPerformanceDto.vendorId && updateVendorPerformanceDto.vendorId !== performance.vendorId) {
      const vendor = await this.vendorRepository.findOne({
        where: { id: updateVendorPerformanceDto.vendorId },
      });
      if (!vendor) {
        throw new NotFoundException(`Vendor with ID ${updateVendorPerformanceDto.vendorId} not found`);
      }
    }

    const updateData: any = { ...updateVendorPerformanceDto };
    if (updateVendorPerformanceDto.periodStart) {
      updateData.periodStart = new Date(updateVendorPerformanceDto.periodStart);
    }
    if (updateVendorPerformanceDto.periodEnd) {
      updateData.periodEnd = new Date(updateVendorPerformanceDto.periodEnd);
    }

    Object.assign(performance, updateData);
    return await this.performanceRepository.save(performance);
  }

  async remove(id: string): Promise<void> {
    const performance = await this.findOne(id);
    await this.performanceRepository.remove(performance);
  }
}

