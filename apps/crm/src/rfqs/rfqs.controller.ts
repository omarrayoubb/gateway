import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { RFQsService } from './rfqs.service';
import type {
  CreateRFQRequest,
  UpdateRFQRequest,
  PaginationRequest,
  FindOneRFQRequest,
  DeleteRFQRequest,
  RFQResponse,
  PaginatedRFQsResponse,
  DeleteRFQResponse,
} from '@app/common/types/rfqs';
import { CreateRFQDto } from './dto/create-rfq.dto';
import { UpdateRFQDto } from './dto/update-rfq.dto';
import { PaginationQueryDto } from './dto/pagination.dto';

@Controller()
export class RFQsController {
  constructor(private readonly rfqsService: RFQsService) {}

  @GrpcMethod('RFQService', 'CreateRFQ')
  async createRFQ(
    data: CreateRFQRequest,
    metadata: Metadata,
  ): Promise<RFQResponse> {
    try {
      console.log("HERE3");
      const createRFQDto = this.mapCreateRequestToDto(data);
      const result = await this.rfqsService.create(createRFQDto);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error('Error in CRM RFQsController.createRFQ:', error);
      throw new RpcException({
        code: error.status === 409 ? 6 : error.status === 404 ? 5 : 2, // ALREADY_EXISTS, NOT_FOUND, UNKNOWN
        message: error.message || 'An unknown error occurred',
      });
    }
  }

  @GrpcMethod('RFQService', 'FindAllRFQs')
  async findAllRFQs(data: PaginationRequest): Promise<PaginatedRFQsResponse> {
    try {
      const page = data.page && typeof data.page === 'number' ? data.page : Number(data.page) || 1;
      const limit = data.limit && typeof data.limit === 'number' ? data.limit : Number(data.limit) || 10;

      const paginationDto: PaginationQueryDto = {
        page: Math.max(1, page),
        limit: Math.max(1, Math.min(100, limit)),
      };

      const result = await this.rfqsService.findAll(paginationDto);

      if (!result || !result.data || !Array.isArray(result.data)) {
        console.error('Invalid result from RFQsService.findAll:', result);
        return {
          data: [],
          total: result?.total || 0,
          page: result?.page || page,
          lastPage: result?.lastPage || 0,
        };
      }

      return {
        data: result.data.map((rfq) => this.mapResponseDtoToProto(rfq)),
        total: result.total || 0,
        page: result.page || page,
        lastPage: result.lastPage || 0,
      };
    } catch (error) {
      console.error('Error in findAllRFQs:', error);
      throw new RpcException({
        code: 13, // INTERNAL
        message: `Failed to fetch RFQs: ${error.message}`,
      });
    }
  }

  @GrpcMethod('RFQService', 'FindOneRFQ')
  async findOneRFQ(data: FindOneRFQRequest): Promise<RFQResponse> {
    try {
      const result = await this.rfqsService.findOne(data.id);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM RFQsController.findOneRFQ for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.status === 404 ? 5 : 2, // NOT_FOUND, UNKNOWN
        message: error.message || `An unknown error occurred during findOneRFQ for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('RFQService', 'UpdateRFQ')
  async updateRFQ(
    data: UpdateRFQRequest,
    metadata: Metadata,
  ): Promise<RFQResponse> {
    try {
      const updateRFQDto = this.mapUpdateRequestToDto(data);
      const result = await this.rfqsService.update(data.id, updateRFQDto);
      return this.mapResponseDtoToProto(result);
    } catch (error) {
      console.error(`Error in CRM RFQsController.updateRFQ for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.status === 404 ? 5 : error.status === 409 ? 6 : 2, // NOT_FOUND, ALREADY_EXISTS, UNKNOWN
        message: error.message || `An unknown error occurred during updateRFQ for ID ${data.id}`,
      });
    }
  }

  @GrpcMethod('RFQService', 'DeleteRFQ')
  async deleteRFQ(data: DeleteRFQRequest): Promise<DeleteRFQResponse> {
    try {
      await this.rfqsService.remove(data.id);
      return {
        success: true,
        message: `RFQ with ID ${data.id} deleted successfully`,
      };
    } catch (error) {
      console.error(`Error in CRM RFQsController.deleteRFQ for ID ${data.id}:`, error);
      throw new RpcException({
        code: error.status === 404 ? 5 : 2, // NOT_FOUND, UNKNOWN
        message: error.message || `An unknown error occurred during deleteRFQ for ID ${data.id}`,
      });
    }
  }

  private mapCreateRequestToDto(data: CreateRFQRequest): CreateRFQDto {
    return {
      rfqName: data.rfqName,
      rfqNumber: data.rfqNumber,
      accountId: data.accountId,
      contactId: data.contactId,
      leadId: data.leadId,
      vendorId: data.vendorId,
      currency: data.currency as any,
      status: data.status as any,
      paymentTerms: data.paymentTerms,
      additionalNotes: data.additionalNotes,
      rfqProducts: data.rfqProducts?.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
        discount: p.discount,
      })),
    };
  }

  private mapUpdateRequestToDto(data: UpdateRFQRequest): UpdateRFQDto {
    return {
      rfqName: data.rfqName,
      rfqNumber: data.rfqNumber,
      accountId: data.accountId,
      contactId: data.contactId,
      leadId: data.leadId,
      vendorId: data.vendorId,
      currency: data.currency as any,
      status: data.status as any,
      paymentTerms: data.paymentTerms,
      additionalNotes: data.additionalNotes,
      rfqProducts: data.rfqProducts?.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
        discount: p.discount,
      })),
    };
  }

  private mapResponseDtoToProto(dto: any): RFQResponse {
    return {
      id: dto.id,
      rfqName: dto.rfqName,
      rfqNumber: dto.rfqNumber,
      accountId: dto.accountId,
      accountName: dto.accountName || '',
      contactId: dto.contactId || undefined,
      contactName: dto.contactName || undefined,
      leadId: dto.leadId || undefined,
      leadName: dto.leadName || undefined,
      vendorId: dto.vendorId || undefined,
      vendorName: dto.vendorName || undefined,
      currency: dto.currency,
      status: dto.status,
      paymentTerms: dto.paymentTerms || undefined,
      additionalNotes: dto.additionalNotes || undefined,
      rfqProducts: (dto.rfqProducts || []).map((p: any) => ({
        id: p.id,
        productId: p.productId,
        productName: p.productName || '',
        quantity: p.quantity,
        discount: p.discount || undefined,
      })),
      createdAt: dto.createdAt instanceof Date ? dto.createdAt.toISOString() : dto.createdAt,
      updatedAt: dto.updatedAt instanceof Date ? dto.updatedAt.toISOString() : dto.updatedAt,
    };
  }
}

