import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorPaginationDto } from './dto/pagination.dto';

export interface PaginatedVendorsResult {
  data: Vendor[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
  ) {}

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    // Check if code already exists
    const existingVendor = await this.vendorRepository.findOne({
      where: { code: createVendorDto.code },
    });
    if (existingVendor) {
      throw new ConflictException(`Vendor with code ${createVendorDto.code} already exists`);
    }

    const vendor = this.vendorRepository.create(createVendorDto);
    return await this.vendorRepository.save(vendor);
  }

  async findAll(paginationQuery: VendorPaginationDto): Promise<PaginatedVendorsResult> {
    const { page = 1, limit = 10, sort, status, search } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.vendorRepository.createQueryBuilder('vendor');

    if (status) {
      queryBuilder.where('vendor.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(vendor.name ILIKE :search OR vendor.code ILIKE :search OR vendor.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Handle sorting
    if (sort) {
      const [field, order] = sort.split(':');
      queryBuilder.orderBy(`vendor.${field}`, order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');
    } else {
      queryBuilder.orderBy('vendor.createdAt', 'DESC');
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

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({ where: { id } });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findOne(id);

    // Check if code is being updated and if it already exists
    if (updateVendorDto.code && updateVendorDto.code !== vendor.code) {
      const existingVendor = await this.vendorRepository.findOne({
        where: { code: updateVendorDto.code },
      });
      if (existingVendor) {
        throw new ConflictException(`Vendor with code ${updateVendorDto.code} already exists`);
      }
    }

    Object.assign(vendor, updateVendorDto);
    return await this.vendorRepository.save(vendor);
  }

  async remove(id: string): Promise<void> {
    const vendor = await this.findOne(id);
    await this.vendorRepository.remove(vendor);
  }
}

