import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehousePaginationDto } from './dto/pagination.dto';

export interface PaginatedWarehousesResult {
  data: Warehouse[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    try {
      const existingWarehouse = await this.warehouseRepository.findOneBy({
        code: createWarehouseDto.code,
      });

      if (existingWarehouse) {
        throw new ConflictException(`Warehouse with code ${createWarehouseDto.code} already exists`);
      }

      const warehouse = this.warehouseRepository.create({
        name: createWarehouseDto.name,
        code: createWarehouseDto.code,
        address: createWarehouseDto.address || null,
        city: createWarehouseDto.city || null,
        country: createWarehouseDto.country || null,
        capacity: createWarehouseDto.capacity || 0,
        status: createWarehouseDto.status,
        temperatureControlled: createWarehouseDto.temperature_controlled || false,
        minTemperature: createWarehouseDto.min_temperature || null,
        maxTemperature: createWarehouseDto.max_temperature || null,
        contactPhone: createWarehouseDto.contact_phone || null,
        contactEmail: createWarehouseDto.contact_email || null,
      });

      return await this.warehouseRepository.save(warehouse);
    } catch (error) {
      console.error('Error in WarehousesService.create:', error);
      throw error;
    }
  }

  async findAll(paginationQuery: WarehousePaginationDto): Promise<PaginatedWarehousesResult> {
    const { page, limit, sort, status, temperature_controlled } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.warehouseRepository.createQueryBuilder('warehouse');

    if (status) {
      queryBuilder.where('warehouse.status = :status', { status });
    }

    if (temperature_controlled !== undefined) {
      const isTemperatureControlled = temperature_controlled === 'true' || temperature_controlled === '1';
      queryBuilder.andWhere('warehouse.temperatureControlled = :temperatureControlled', {
        temperatureControlled: isTemperatureControlled,
      });
    }

    // Handle sorting
    if (sort) {
      const [field, order] = sort.split(':');
      queryBuilder.orderBy(`warehouse.${field}`, order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');
    } else {
      queryBuilder.orderBy('warehouse.createdAt', 'DESC');
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

  async findOne(id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
      relations: ['alerts'],
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    return warehouse;
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.findOne(id);

    if (updateWarehouseDto.code && updateWarehouseDto.code !== warehouse.code) {
      const existingWarehouse = await this.warehouseRepository.findOneBy({
        code: updateWarehouseDto.code,
      });

      if (existingWarehouse) {
        throw new ConflictException(`Warehouse with code ${updateWarehouseDto.code} already exists`);
      }
    }

    if (updateWarehouseDto.name !== undefined) warehouse.name = updateWarehouseDto.name;
    if (updateWarehouseDto.code !== undefined) warehouse.code = updateWarehouseDto.code;
    if (updateWarehouseDto.address !== undefined) warehouse.address = updateWarehouseDto.address || null;
    if (updateWarehouseDto.city !== undefined) warehouse.city = updateWarehouseDto.city || null;
    if (updateWarehouseDto.country !== undefined) warehouse.country = updateWarehouseDto.country || null;
    if (updateWarehouseDto.capacity !== undefined) warehouse.capacity = updateWarehouseDto.capacity;
    if (updateWarehouseDto.status !== undefined) warehouse.status = updateWarehouseDto.status;
    if (updateWarehouseDto.temperature_controlled !== undefined) warehouse.temperatureControlled = updateWarehouseDto.temperature_controlled;
    if (updateWarehouseDto.min_temperature !== undefined) warehouse.minTemperature = updateWarehouseDto.min_temperature || null;
    if (updateWarehouseDto.max_temperature !== undefined) warehouse.maxTemperature = updateWarehouseDto.max_temperature || null;
    if (updateWarehouseDto.contact_phone !== undefined) warehouse.contactPhone = updateWarehouseDto.contact_phone || null;
    if (updateWarehouseDto.contact_email !== undefined) warehouse.contactEmail = updateWarehouseDto.contact_email || null;

    return await this.warehouseRepository.save(warehouse);
  }

  async remove(id: string): Promise<void> {
    const warehouse = await this.findOne(id);
    await this.warehouseRepository.remove(warehouse);
  }
}

