import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { VendorPerformanceService } from './vendor-performance.service';
import { CreateVendorPerformanceDto } from './dto/create-vendor-performance.dto';
import { UpdateVendorPerformanceDto } from './dto/update-vendor-performance.dto';

@Controller()
export class VendorPerformanceGrpcController {
  constructor(private readonly performanceService: VendorPerformanceService) {}

  @GrpcMethod('VendorPerformanceService', 'GetVendorPerformance')
  async getVendorPerformance(data: { id: string }) {
    try {
      const performance = await this.performanceService.findOne(data.id);
      return this.mapPerformanceToProto(performance);
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to get vendor performance',
      });
    }
  }

  @GrpcMethod('VendorPerformanceService', 'GetVendorPerformances')
  async getVendorPerformances(data: {
    page?: number;
    limit?: number;
    vendorId?: string;
    sort?: string;
  }) {
    try {
      const page = data.page || 1;
      const limit = data.limit || 10;
      const result = await this.performanceService.findAll({
        page,
        limit,
        vendorId: data.vendorId,
        sort: data.sort,
      });
      return {
        performances: result.data.map(perf => this.mapPerformanceToProto(perf)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get vendor performances',
      });
    }
  }

  @GrpcMethod('VendorPerformanceService', 'CreateVendorPerformance')
  async createVendorPerformance(data: any) {
    try {
      const createDto: CreateVendorPerformanceDto = {
        vendorId: data.vendorId,
        periodStart: data.periodStart || data.period_start,
        periodEnd: data.periodEnd || data.period_end,
        onTimeDeliveryRate: data.onTimeDeliveryRate ? parseFloat(data.onTimeDeliveryRate.toString()) : (data.on_time_delivery_rate ? parseFloat(data.on_time_delivery_rate.toString()) : undefined),
        qualityScore: data.qualityScore ? parseFloat(data.qualityScore.toString()) : (data.quality_score ? parseFloat(data.quality_score.toString()) : undefined),
        totalOrders: data.totalOrders ? parseInt(data.totalOrders.toString()) : (data.total_orders ? parseInt(data.total_orders.toString()) : undefined),
        totalAmount: data.totalAmount ? parseFloat(data.totalAmount.toString()) : (data.total_amount ? parseFloat(data.total_amount.toString()) : undefined),
      };
      const performance = await this.performanceService.create(createDto);
      return this.mapPerformanceToProto(performance);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create vendor performance',
      });
    }
  }

  @GrpcMethod('VendorPerformanceService', 'UpdateVendorPerformance')
  async updateVendorPerformance(data: any) {
    try {
      const updateDto: UpdateVendorPerformanceDto = {
        vendorId: data.vendorId,
        periodStart: data.periodStart || data.period_start,
        periodEnd: data.periodEnd || data.period_end,
        onTimeDeliveryRate: data.onTimeDeliveryRate ? parseFloat(data.onTimeDeliveryRate.toString()) : (data.on_time_delivery_rate ? parseFloat(data.on_time_delivery_rate.toString()) : undefined),
        qualityScore: data.qualityScore ? parseFloat(data.qualityScore.toString()) : (data.quality_score ? parseFloat(data.quality_score.toString()) : undefined),
        totalOrders: data.totalOrders ? parseInt(data.totalOrders.toString()) : (data.total_orders ? parseInt(data.total_orders.toString()) : undefined),
        totalAmount: data.totalAmount ? parseFloat(data.totalAmount.toString()) : (data.total_amount ? parseFloat(data.total_amount.toString()) : undefined),
      };
      const performance = await this.performanceService.update(data.id, updateDto);
      return this.mapPerformanceToProto(performance);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update vendor performance',
      });
    }
  }

  @GrpcMethod('VendorPerformanceService', 'DeleteVendorPerformance')
  async deleteVendorPerformance(data: { id: string }) {
    try {
      await this.performanceService.remove(data.id);
      return { success: true };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete vendor performance',
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

  private mapPerformanceToProto(performance: any) {
    return {
      id: performance.id,
      vendorId: performance.vendorId,
      vendorName: performance.vendor?.name || '',
      periodStart: this.formatDate(performance.periodStart),
      periodEnd: this.formatDate(performance.periodEnd),
      onTimeDeliveryRate: performance.onTimeDeliveryRate?.toString() || '',
      qualityScore: performance.qualityScore?.toString() || '',
      totalOrders: performance.totalOrders?.toString() || '0',
      totalAmount: performance.totalAmount?.toString() || '0',
      createdAt: this.formatDateTime(performance.createdAt),
      updatedAt: this.formatDateTime(performance.updatedAt),
    };
  }
}

