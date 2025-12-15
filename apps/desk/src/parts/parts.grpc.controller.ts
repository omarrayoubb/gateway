import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Controller()
export class PartsGrpcController {
  constructor(private readonly partsService: PartsService) {}

  @GrpcMethod('PartsService', 'GetPart')
  async getPart(data: { id: string }) {
    const parts = await this.partsService.findAll();
    const part = parts.find(p => p.id === data.id);
    if (!part) {
      throw new Error('Part not found');
    }
    return this.mapPartToProto(part);
  }

  @GrpcMethod('PartsService', 'GetParts')
  async getParts(data: { page?: number; limit?: number; search?: string }) {
    const parts = await this.partsService.findAll();
    return {
      parts: parts.map(part => this.mapPartToProto(part)),
      total: parts.length,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  }

  @GrpcMethod('PartsService', 'CreatePart')
  async createPart(data: any) {
    // Parts service doesn't have create method yet, return error
    throw new Error('Create part not implemented');
  }

  @GrpcMethod('PartsService', 'UpdatePart')
  async updatePart(data: any) {
    // Parts service doesn't have update method yet, return error
    throw new Error('Update part not implemented');
  }

  @GrpcMethod('PartsService', 'DeletePart')
  async deletePart(data: { id: string }) {
    // Parts service doesn't have remove method yet, return error
    throw new Error('Delete part not implemented');
  }

  private mapPartToProto(part: any) {
    return {
      id: part.id,
      name: part.name || '',
      price: part.price || 0,
      created_at: part.createdAt?.toISOString() || '',
      updated_at: part.updatedAt?.toISOString() || '',
    };
  }
}

