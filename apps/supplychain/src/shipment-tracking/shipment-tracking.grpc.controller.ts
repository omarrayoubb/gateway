import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ShipmentTrackingService } from './shipment-tracking.service';
import { CreateShipmentTrackingDto } from './dto/create-shipment-tracking.dto';
import { UpdateShipmentTrackingDto } from './dto/update-shipment-tracking.dto';

@Controller()
export class ShipmentTrackingGrpcController {
  constructor(private readonly trackingService: ShipmentTrackingService) {}

  @GrpcMethod('ShipmentTrackingService', 'GetShipmentTracking')
  async getShipmentTracking(data: { id: string }) {
    try {
      const tracking = await this.trackingService.findOne(data.id);
      return this.mapTrackingToProto(tracking);
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to get shipment tracking',
      });
    }
  }

  @GrpcMethod('ShipmentTrackingService', 'GetShipmentTrackings')
  async getShipmentTrackings(data: {
    page?: number;
    limit?: number;
    shipmentId?: string;
    sort?: string;
  }) {
    try {
      const page = data.page || 1;
      const limit = data.limit || 10;
      const result = await this.trackingService.findAll({
        page,
        limit,
        shipmentId: data.shipmentId,
        sort: data.sort,
      });
      return {
        trackings: result.data.map(tracking => this.mapTrackingToProto(tracking)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get shipment trackings',
      });
    }
  }

  @GrpcMethod('ShipmentTrackingService', 'CreateShipmentTracking')
  async createShipmentTracking(data: any) {
    try {
      const createDto: CreateShipmentTrackingDto = {
        shipmentId: data.shipmentId || data.shipment_id,
        status: data.status,
        location: data.location,
        description: data.description,
        timestamp: data.timestamp,
        updatedBy: data.updatedBy || data.updated_by || 'manual',
        isAutomated: data.isAutomated !== undefined ? data.isAutomated : (data.is_automated !== undefined ? data.is_automated : false),
      };
      const tracking = await this.trackingService.create(createDto);
      return this.mapTrackingToProto(tracking);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create shipment tracking',
      });
    }
  }

  @GrpcMethod('ShipmentTrackingService', 'UpdateShipmentTracking')
  async updateShipmentTracking(data: any) {
    try {
      const updateDto: UpdateShipmentTrackingDto = {
        shipmentId: data.shipmentId || data.shipment_id,
        status: data.status,
        location: data.location,
        description: data.description,
        timestamp: data.timestamp,
        updatedBy: data.updatedBy || data.updated_by,
        isAutomated: data.isAutomated !== undefined ? data.isAutomated : (data.is_automated !== undefined ? data.is_automated : undefined),
      };
      const tracking = await this.trackingService.update(data.id, updateDto);
      return this.mapTrackingToProto(tracking);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update shipment tracking',
      });
    }
  }

  @GrpcMethod('ShipmentTrackingService', 'DeleteShipmentTracking')
  async deleteShipmentTracking(data: { id: string }) {
    try {
      await this.trackingService.remove(data.id);
      return { success: true };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete shipment tracking',
      });
    }
  }

  private formatDateTime(date: Date | string | null | undefined): string {
    if (!date) return '';
    if (typeof date === 'string') {
      try {
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) return '';
        return parsed.toISOString();
      } catch {
        return '';
      }
    }
    if (date instanceof Date) {
      return date.toISOString();
    }
    return '';
  }

  private mapTrackingToProto(tracking: any) {
    return {
      id: tracking.id,
      shipmentId: tracking.shipmentId,
      shipmentNumber: tracking.shipment?.shipmentNumber || '',
      status: tracking.status,
      location: tracking.location || '',
      description: tracking.description || '',
      timestamp: this.formatDateTime(tracking.timestamp),
      updatedBy: tracking.updatedBy,
      isAutomated: tracking.isAutomated ? 'true' : 'false',
      createdAt: this.formatDateTime(tracking.createdAt),
      updatedAt: this.formatDateTime(tracking.updatedAt),
    };
  }
}

