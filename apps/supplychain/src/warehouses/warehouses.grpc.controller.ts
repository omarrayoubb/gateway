import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Controller()
export class WarehousesGrpcController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @GrpcMethod('WarehousesService', 'GetWarehouse')
  async getWarehouse(data: { id: string }) {
    try {
      const warehouse = await this.warehousesService.findOne(data.id);
      return this.mapWarehouseToProto(warehouse);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2, // NOT_FOUND : UNKNOWN
        message: error.message || 'Failed to get warehouse',
      });
    }
  }

  @GrpcMethod('WarehousesService', 'GetWarehouses')
  async getWarehouses(data: {
    page?: number;
    limit?: number;
    sort?: string;
    status?: string;
    temperature_controlled?: string;
  }) {
    try {
      const page = data.page || 1;
      const limit = data.limit || 10;
      const result = await this.warehousesService.findAll({
        page,
        limit,
        sort: data.sort,
        status: data.status as any,
        temperature_controlled: data.temperature_controlled,
      });
      return {
        warehouses: result.data.map(warehouse => this.mapWarehouseToProto(warehouse)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      throw new RpcException({
        code: 2, // UNKNOWN
        message: error.message || 'Failed to get warehouses',
      });
    }
  }

  @GrpcMethod('WarehousesService', 'CreateWarehouse')
  async createWarehouse(data: any) {
    try {
      const createDto: CreateWarehouseDto = {
        name: data.name,
        code: data.code,
        address: data.address,
        city: data.city,
        country: data.country,
        capacity: data.capacity ? parseFloat(data.capacity) : 0,
        status: data.status,
        temperature_controlled: data.temperature_controlled === 'true' || data.temperature_controlled === true,
        min_temperature: data.min_temperature ? parseFloat(data.min_temperature) : undefined,
        max_temperature: data.max_temperature ? parseFloat(data.max_temperature) : undefined,
        contact_phone: data.contact_phone || undefined,
        contact_email: data.contact_email || undefined,
      };
      const warehouse = await this.warehousesService.create(createDto);
      return this.mapWarehouseToProto(warehouse);
    } catch (error) {
      const code = error.status === 409 ? 6 : error.status === 400 ? 3 : 2; // ALREADY_EXISTS : INVALID_ARGUMENT : UNKNOWN
      throw new RpcException({
        code,
        message: error.message || 'Failed to create warehouse',
      });
    }
  }

  @GrpcMethod('WarehousesService', 'UpdateWarehouse')
  async updateWarehouse(data: any) {
    try {
      const updateDto: UpdateWarehouseDto = {
        name: data.name,
        code: data.code,
        address: data.address,
        city: data.city,
        country: data.country,
        capacity: data.capacity ? parseFloat(data.capacity) : undefined,
        status: data.status,
        temperature_controlled: data.temperature_controlled === 'true' || data.temperature_controlled === true,
        min_temperature: data.min_temperature ? parseFloat(data.min_temperature) : undefined,
        max_temperature: data.max_temperature ? parseFloat(data.max_temperature) : undefined,
        contact_phone: data.contact_phone,
        contact_email: data.contact_email,
      };
      const warehouse = await this.warehousesService.update(data.id, updateDto);
      return this.mapWarehouseToProto(warehouse);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update warehouse',
      });
    }
  }

  @GrpcMethod('WarehousesService', 'DeleteWarehouse')
  async deleteWarehouse(data: { id: string }) {
    try {
      await this.warehousesService.remove(data.id);
      return { success: true, message: 'Warehouse deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2; // NOT_FOUND : UNKNOWN
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete warehouse',
      });
    }
  }

  private mapWarehouseToProto(warehouse: any) {
      return {
        id: warehouse.id,
        name: warehouse.name,
        code: warehouse.code,
        address: warehouse.address || '',
        city: warehouse.city || '',
        country: warehouse.country || '',
        capacity: warehouse.capacity?.toString() || '0',
        status: warehouse.status,
        temperature_controlled: warehouse.temperatureControlled ? 'true' : 'false',
        min_temperature: warehouse.minTemperature?.toString() || '',
        max_temperature: warehouse.maxTemperature?.toString() || '',
        contact_phone: warehouse.contactPhone || '',
        contact_email: warehouse.contactEmail || '',
        created_at: warehouse.createdAt?.toISOString() || '',
        updated_at: warehouse.updatedAt?.toISOString() || '',
      };
  }
}

