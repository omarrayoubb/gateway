import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { BulkDeleteResponse } from './dto/bulk-delete-response.dto';
import { BulkUpdateServiceDto } from './dto/bulk-update.dto';
import { BulkUpdateResponse } from './dto/bulk-update-response.dto';
import { ServiceResponseDto } from './dto/service-response.dto';

export interface PaginatedServicesResult {
  data: ServiceResponseDto[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto, currentUser: { id: string; name: string; email: string }): Promise<ServiceResponseDto> {
    const service = this.serviceRepository.create(createServiceDto);
    const savedService = await this.serviceRepository.save(service);
    return this._transformServiceToResponse(savedService);
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedServicesResult> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.serviceRepository.findAndCount({
      take: limit,
      skip: skip,
      order: {
        name: 'ASC',
      },
    });

    const lastPage = Math.ceil(total / limit);
    const transformedData = data.map((service) => this._transformServiceToResponse(service));

    return {
      data: transformedData,
      total,
      page,
      lastPage,
    };
  }

  async findOne(id: string): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return this._transformServiceToResponse(service);
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, currentUser: { id: string; name: string; email: string }): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    Object.assign(service, updateServiceDto);
    const savedService = await this.serviceRepository.save(service);
    return this._transformServiceToResponse(savedService);
  }

  async remove(id: string): Promise<void> {
    const service = await this.serviceRepository.findOneBy({ id });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    await this.serviceRepository.remove(service);
  }

  async bulkRemove(bulkDeleteDto: BulkDeleteDto): Promise<BulkDeleteResponse> {
    const { ids } = bulkDeleteDto;
    const failedIds: Array<{ id: string; error: string }> = [];
    let deletedCount = 0;

    const services = await this.serviceRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(services.map((s) => s.id));

    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedIds.push({ id, error: 'Service not found' });
      }
    }

    if (services.length > 0) {
      await this.serviceRepository.remove(services);
      deletedCount = services.length;
    }

    return {
      deletedCount,
      ...(failedIds.length > 0 && { failedIds }),
    };
  }

  async bulkUpdate(bulkUpdateDto: BulkUpdateServiceDto, currentUser: { id: string; name: string; email: string }): Promise<BulkUpdateResponse> {
    const { ids, updateFields } = bulkUpdateDto;
    const failedItems: Array<{ id: string; error: string }> = [];
    let updatedCount = 0;

    const services = await this.serviceRepository.find({
      where: { id: In(ids) },
    });

    const foundIds = new Set(services.map((s) => s.id));

    for (const id of ids) {
      if (!foundIds.has(id)) {
        failedItems.push({ id, error: 'Service not found' });
      }
    }

    for (const service of services) {
      if (failedItems.some((f) => f.id === service.id)) {
        continue;
      }

      try {
        Object.assign(service, updateFields);
        await this.serviceRepository.save(service);
        updatedCount++;
      } catch (error) {
        failedItems.push({
          id: service.id,
          error: error.message || 'Failed to update service',
        });
      }
    }

    return {
      updatedCount,
      ...(failedItems.length > 0 && { failedItems }),
    };
  }

  private _transformServiceToResponse(service: Service): ServiceResponseDto {
    return {
      id: service.id,
      name: service.name,
      netPrice: service.netPrice,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}

