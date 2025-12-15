import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductAlertsService } from './product-alerts.service';
import { UpdateProductAlertDto } from './dto/update-product-alert.dto';

@Controller()
export class ProductAlertsGrpcController {
  constructor(private readonly alertsService: ProductAlertsService) {}

  @GrpcMethod('ProductAlertsService', 'GetProductAlert')
  async getProductAlert(data: { id: string }) {
    const alert = await this.alertsService.findOne(data.id);
    return this.mapAlertToProto(alert);
  }

  @GrpcMethod('ProductAlertsService', 'GetProductAlerts')
  async getProductAlerts(data: {
    page?: number;
    limit?: number;
    product_id?: string;
    warehouse_id?: string;
    status?: string;
    severity?: string;
  }) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const result = await this.alertsService.findAll({
      page,
      limit,
      productId: data.product_id,
      warehouseId: data.warehouse_id,
      status: data.status as any,
      severity: data.severity as any,
    });
    return {
      alerts: result.data.map(alert => this.mapAlertToProto(alert)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @GrpcMethod('ProductAlertsService', 'UpdateProductAlert')
  async updateProductAlert(data: any) {
    const updateDto: UpdateProductAlertDto = {
      status: data.status,
      acknowledgedAt: data.acknowledged_at,
      resolvedAt: data.resolved_at,
    };
    const alert = await this.alertsService.update(data.id, updateDto);
    return this.mapAlertToProto(alert);
  }

  @GrpcMethod('ProductAlertsService', 'DeleteProductAlert')
  async deleteProductAlert(data: { id: string }) {
    await this.alertsService.remove(data.id);
    return { success: true, message: 'Product alert deleted successfully' };
  }

  private mapAlertToProto(alert: any) {
    return {
      id: alert.id,
      product_id: alert.productId,
      product_name: alert.product?.name || '',
      warehouse_id: alert.warehouseId || '',
      status: alert.status,
      severity: alert.severity,
      message: alert.message,
      description: alert.description || '',
      acknowledged_at: alert.acknowledgedAt?.toISOString() || '',
      resolved_at: alert.resolvedAt?.toISOString() || '',
      created_at: alert.createdAt?.toISOString() || '',
      updated_at: alert.updatedAt?.toISOString() || '',
    };
  }
}

