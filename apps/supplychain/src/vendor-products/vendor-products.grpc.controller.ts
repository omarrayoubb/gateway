import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { VendorProductsService } from './vendor-products.service';
import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';

@Controller()
export class VendorProductsGrpcController {
  constructor(private readonly vendorProductsService: VendorProductsService) {}

  @GrpcMethod('VendorProductsService', 'GetVendorProduct')
  async getVendorProduct(data: { id: string }) {
    try {
      const vendorProduct = await this.vendorProductsService.findOne(data.id);
      return this.mapVendorProductToProto(vendorProduct);
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to get vendor product',
      });
    }
  }

  @GrpcMethod('VendorProductsService', 'GetVendorProducts')
  async getVendorProducts(data: {
    page?: number;
    limit?: number;
    vendorId?: string;
    productId?: string;
    status?: string;
    sort?: string;
  }) {
    try {
      const page = data.page || 1;
      const limit = data.limit || 10;
      const result = await this.vendorProductsService.findAll({
        page,
        limit,
        vendorId: data.vendorId,
        productId: data.productId,
        status: data.status as any,
        sort: data.sort,
      });
      return {
        vendorProducts: result.data.map(vp => this.mapVendorProductToProto(vp)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get vendor products',
      });
    }
  }

  @GrpcMethod('VendorProductsService', 'CreateVendorProduct')
  async createVendorProduct(data: any) {
    try {
      const createDto: CreateVendorProductDto = {
        vendorId: data.vendorId,
        productId: data.productId,
        vendorSku: data.vendorSku || data.vendor_sku,
        unitPrice: parseFloat(data.unitPrice?.toString() || '0'),
        minimumOrderQuantity: parseInt(data.minimumOrderQuantity?.toString() || data.minimum_order_quantity?.toString() || '1'),
        leadTimeDays: data.leadTimeDays ? parseInt(data.leadTimeDays.toString()) : (data.lead_time_days ? parseInt(data.lead_time_days.toString()) : undefined),
        status: data.status || 'active',
        priceTiers: data.priceTiers || data.price_tiers || [],
      };
      const vendorProduct = await this.vendorProductsService.create(createDto);
      return this.mapVendorProductToProto(vendorProduct);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create vendor product',
      });
    }
  }

  @GrpcMethod('VendorProductsService', 'UpdateVendorProduct')
  async updateVendorProduct(data: any) {
    try {
      const updateDto: UpdateVendorProductDto = {
        vendorId: data.vendorId,
        productId: data.productId,
        vendorSku: data.vendorSku || data.vendor_sku,
        unitPrice: data.unitPrice ? parseFloat(data.unitPrice.toString()) : undefined,
        minimumOrderQuantity: data.minimumOrderQuantity ? parseInt(data.minimumOrderQuantity.toString()) : (data.minimum_order_quantity ? parseInt(data.minimum_order_quantity.toString()) : undefined),
        leadTimeDays: data.leadTimeDays ? parseInt(data.leadTimeDays.toString()) : (data.lead_time_days ? parseInt(data.lead_time_days.toString()) : undefined),
        status: data.status,
        priceTiers: data.priceTiers || data.price_tiers,
      };
      const vendorProduct = await this.vendorProductsService.update(data.id, updateDto);
      return this.mapVendorProductToProto(vendorProduct);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update vendor product',
      });
    }
  }

  @GrpcMethod('VendorProductsService', 'DeleteVendorProduct')
  async deleteVendorProduct(data: { id: string }) {
    try {
      await this.vendorProductsService.remove(data.id);
      return { success: true };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete vendor product',
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

  private mapVendorProductToProto(vendorProduct: any) {
    return {
      id: vendorProduct.id,
      vendorId: vendorProduct.vendorId,
      vendorName: vendorProduct.vendor?.name || '',
      productId: vendorProduct.productId,
      productName: vendorProduct.product?.name || '',
      productSku: vendorProduct.product?.sku || '',
      vendorSku: vendorProduct.vendorSku || '',
      unitPrice: vendorProduct.unitPrice?.toString() || '0',
      minimumOrderQuantity: vendorProduct.minimumOrderQuantity?.toString() || '1',
      leadTimeDays: vendorProduct.leadTimeDays?.toString() || '',
      status: vendorProduct.status,
      priceTiers: vendorProduct.priceTiers ? JSON.stringify(vendorProduct.priceTiers) : '',
      createdAt: this.formatDateTime(vendorProduct.createdAt),
      updatedAt: this.formatDateTime(vendorProduct.updatedAt),
    };
  }
}

