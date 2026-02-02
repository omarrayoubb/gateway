import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShipmentTracking } from './entities/shipment-tracking.entity';
import { CreateShipmentTrackingDto } from './dto/create-shipment-tracking.dto';
import { UpdateShipmentTrackingDto } from './dto/update-shipment-tracking.dto';
import { ShipmentTrackingPaginationDto } from './dto/pagination.dto';
import { Shipment } from '../shipments/entities/shipment.entity';

export interface PaginatedShipmentTrackingResult {
  data: ShipmentTracking[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable()
export class ShipmentTrackingService {
  constructor(
    @InjectRepository(ShipmentTracking)
    private trackingRepository: Repository<ShipmentTracking>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
  ) {}

  async create(createShipmentTrackingDto: CreateShipmentTrackingDto): Promise<ShipmentTracking> {
    // Validate shipment exists
    const shipment = await this.shipmentRepository.findOne({
      where: { id: createShipmentTrackingDto.shipmentId },
    });
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${createShipmentTrackingDto.shipmentId} not found`);
    }

    const tracking = this.trackingRepository.create({
      ...createShipmentTrackingDto,
      timestamp: createShipmentTrackingDto.timestamp ? new Date(createShipmentTrackingDto.timestamp) : new Date(),
    });
    return await this.trackingRepository.save(tracking);
  }

  async findAll(paginationQuery: ShipmentTrackingPaginationDto): Promise<PaginatedShipmentTrackingResult> {
    const { page = 1, limit = 10, shipmentId, sort } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.trackingRepository
      .createQueryBuilder('tracking')
      .leftJoinAndSelect('tracking.shipment', 'shipment');

    if (shipmentId) {
      queryBuilder.where('tracking.shipmentId = :shipmentId', { shipmentId });
    }

    // Handle sorting - support both -field and field:DESC formats
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      const order = sort.startsWith('-') ? 'DESC' : 'ASC';
      
      // Map common field names
      const fieldMap: Record<string, string> = {
        'timestamp': 'timestamp',
        'created_at': 'createdAt',
        'updated_at': 'updatedAt',
        'status': 'status',
      };
      
      const dbField = fieldMap[sortField] || sortField;
      queryBuilder.orderBy(`tracking.${dbField}`, order);
    } else {
      queryBuilder.orderBy('tracking.timestamp', 'DESC');
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

  async findOne(id: string): Promise<ShipmentTracking> {
    const tracking = await this.trackingRepository.findOne({
      where: { id },
      relations: ['shipment'],
    });
    if (!tracking) {
      throw new NotFoundException(`Shipment tracking with ID ${id} not found`);
    }
    return tracking;
  }

  async update(id: string, updateShipmentTrackingDto: UpdateShipmentTrackingDto): Promise<ShipmentTracking> {
    const tracking = await this.findOne(id);

    // Validate shipment if being updated
    if (updateShipmentTrackingDto.shipmentId && updateShipmentTrackingDto.shipmentId !== tracking.shipmentId) {
      const shipment = await this.shipmentRepository.findOne({
        where: { id: updateShipmentTrackingDto.shipmentId },
      });
      if (!shipment) {
        throw new NotFoundException(`Shipment with ID ${updateShipmentTrackingDto.shipmentId} not found`);
      }
    }

    const updateData: any = { ...updateShipmentTrackingDto };
    if (updateShipmentTrackingDto.timestamp) {
      updateData.timestamp = new Date(updateShipmentTrackingDto.timestamp);
    }

    Object.assign(tracking, updateData);
    return await this.trackingRepository.save(tracking);
  }

  async remove(id: string): Promise<void> {
    const tracking = await this.findOne(id);
    await this.trackingRepository.remove(tracking);
  }
}

