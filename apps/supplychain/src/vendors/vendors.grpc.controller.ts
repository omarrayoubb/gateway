import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Controller()
export class VendorsGrpcController {
  constructor(private readonly vendorsService: VendorsService) {}

  @GrpcMethod('VendorsService', 'GetVendor')
  async getVendor(data: { id: string }) {
    try {
      const vendor = await this.vendorsService.findOne(data.id);
      return this.mapVendorToProto(vendor);
    } catch (error) {
      const code = error.status === 404 ? 5 : 2; // NOT_FOUND : UNKNOWN
      throw new RpcException({
        code,
        message: error.message || 'Failed to get vendor',
      });
    }
  }

  @GrpcMethod('VendorsService', 'GetVendors')
  async getVendors(data: {
    page?: number;
    limit?: number;
    sort?: string;
    status?: string;
    search?: string;
  }) {
    try {
      const page = data.page || 1;
      const limit = data.limit || 10;
      const result = await this.vendorsService.findAll({
        page,
        limit,
        sort: data.sort,
        status: data.status as any,
        search: data.search,
      });
      return {
        vendors: result.data.map(vendor => this.mapVendorToProto(vendor)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      throw new RpcException({
        code: 2, // UNKNOWN
        message: error.message || 'Failed to get vendors',
      });
    }
  }

  @GrpcMethod('VendorsService', 'CreateVendor')
  async createVendor(data: any) {
    try {
      const createDto: CreateVendorDto = {
        name: data.name,
        code: data.code,
        contactPerson: data.contactPerson || data.contact_person,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        taxId: data.taxId || data.tax_id,
        paymentTerms: data.paymentTerms || data.payment_terms,
        currency: data.currency || 'USD',
        status: data.status || 'active',
        rating: data.rating ? parseFloat(data.rating.toString()) : undefined,
        notes: data.notes,
      };
      const vendor = await this.vendorsService.create(createDto);
      return this.mapVendorToProto(vendor);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create vendor',
      });
    }
  }

  @GrpcMethod('VendorsService', 'UpdateVendor')
  async updateVendor(data: any) {
    try {
      const updateDto: UpdateVendorDto = {
        name: data.name,
        code: data.code,
        contactPerson: data.contactPerson || data.contact_person,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        taxId: data.taxId || data.tax_id,
        paymentTerms: data.paymentTerms || data.payment_terms,
        currency: data.currency,
        status: data.status,
        rating: data.rating ? parseFloat(data.rating.toString()) : undefined,
        notes: data.notes,
      };
      const vendor = await this.vendorsService.update(data.id, updateDto);
      return this.mapVendorToProto(vendor);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update vendor',
      });
    }
  }

  @GrpcMethod('VendorsService', 'DeleteVendor')
  async deleteVendor(data: { id: string }) {
    try {
      await this.vendorsService.remove(data.id);
      return { success: true };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete vendor',
      });
    }
  }

  private formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    if (typeof date === 'string') {
      try {
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) return '';
        return parsed.toISOString().split('T')[0];
      } catch {
        return '';
      }
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return '';
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

  private mapVendorToProto(vendor: any) {
    return {
      id: vendor.id,
      name: vendor.name,
      code: vendor.code,
      contactPerson: vendor.contactPerson || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      city: vendor.city || '',
      country: vendor.country || '',
      taxId: vendor.taxId || '',
      paymentTerms: vendor.paymentTerms || '',
      currency: vendor.currency || 'USD',
      status: vendor.status,
      rating: vendor.rating?.toString() || '0',
      notes: vendor.notes || '',
      createdAt: this.formatDateTime(vendor.createdAt),
      updatedAt: this.formatDateTime(vendor.updatedAt),
    };
  }
}

