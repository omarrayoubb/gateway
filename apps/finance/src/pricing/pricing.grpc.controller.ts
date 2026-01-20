import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PricingService } from './pricing.service';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { PricingPaginationDto } from './dto/pagination.dto';
import { CalculatePricingDto } from './dto/calculate-pricing.dto';

@Controller()
export class PricingGrpcController {
  constructor(private readonly pricingService: PricingService) {}

  @GrpcMethod('PricingService', 'GetPricings')
  async getPricings(data: any) {
    try {
      const paginationDto: PricingPaginationDto = {
        sort: data.sort,
        product_id: data.productId,
        customer_id: data.customerId,
        is_active: data.isActive !== undefined ? data.isActive : undefined,
        effective_date: data.effectiveDate,
      };

      const pricings = await this.pricingService.findAll(paginationDto);
      return {
        pricings: pricings.map((pricing) => this.mapPricingToProto(pricing)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get pricings',
      });
    }
  }

  @GrpcMethod('PricingService', 'GetPricing')
  async getPricing(data: { id: string }) {
    try {
      const pricing = await this.pricingService.findOne(data.id);
      return this.mapPricingToProto(pricing);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get pricing',
      });
    }
  }

  @GrpcMethod('PricingService', 'CreatePricing')
  async createPricing(data: any) {
    try {
      const createDto: CreatePricingDto = {
        organization_id: data.organizationId || '',
        pricing_code: data.pricingCode,
        product_id: data.productId,
        customer_id: data.customerId || undefined,
        pricing_type: data.pricingType,
        base_price: data.basePrice ? parseFloat(data.basePrice) : undefined,
        discount_percent: data.discountPercent ? parseFloat(data.discountPercent) : undefined,
        discount_amount: data.discountAmount ? parseFloat(data.discountAmount) : undefined,
        currency: data.currency || undefined,
        minimum_quantity: data.minimumQuantity ? parseInt(data.minimumQuantity) : undefined,
        effective_date: data.effectiveDate,
        expiry_date: data.expiryDate || undefined,
        is_active: data.isActive !== undefined ? data.isActive : undefined,
        notes: data.notes || undefined,
      };

      const pricing = await this.pricingService.create(createDto);
      return this.mapPricingToProto(pricing);
    } catch (error) {
      console.error('Error creating pricing:', error);
      const errorMessage = error.message || error.toString() || 'Failed to create pricing';
      throw new RpcException({
        code: 2,
        message: errorMessage,
      });
    }
  }

  @GrpcMethod('PricingService', 'UpdatePricing')
  async updatePricing(data: any) {
    try {
      const updateDto: UpdatePricingDto = {
        ...(data.pricingCode && { pricing_code: data.pricingCode }),
        ...(data.productId && { product_id: data.productId }),
        ...(data.customerId !== undefined && { customer_id: data.customerId }),
        ...(data.pricingType && { pricing_type: data.pricingType }),
        ...(data.basePrice !== undefined && { base_price: parseFloat(data.basePrice) }),
        ...(data.discountPercent !== undefined && { discount_percent: parseFloat(data.discountPercent) }),
        ...(data.discountAmount !== undefined && { discount_amount: parseFloat(data.discountAmount) }),
        ...(data.currency && { currency: data.currency }),
        ...(data.minimumQuantity !== undefined && { minimum_quantity: parseInt(data.minimumQuantity) }),
        ...(data.effectiveDate && { effective_date: data.effectiveDate }),
        ...(data.expiryDate !== undefined && { expiry_date: data.expiryDate }),
        ...(data.isActive !== undefined && { is_active: data.isActive }),
        ...(data.notes !== undefined && { notes: data.notes }),
      };

      const pricing = await this.pricingService.update(data.id, updateDto);
      return this.mapPricingToProto(pricing);
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to update pricing',
      });
    }
  }

  @GrpcMethod('PricingService', 'DeletePricing')
  async deletePricing(data: { id: string }) {
    try {
      await this.pricingService.remove(data.id);
      return { success: true, message: 'Pricing deleted successfully' };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to delete pricing',
      });
    }
  }

  @GrpcMethod('PricingService', 'CalculatePricing')
  async calculatePricing(data: any) {
    try {
      const calculateDto: CalculatePricingDto = {
        product_id: data.productId,
        customer_id: data.customerId || undefined,
        quantity: parseInt(data.quantity),
        date: data.date || undefined,
      };

      const result = await this.pricingService.calculate(calculateDto);
      return {
        productId: result.product_id || '',
        productCode: result.product_code || '',
        productName: result.product_name || '',
        customerId: result.customer_id || '',
        customerName: result.customer_name || '',
        quantity: result.quantity.toString(),
        basePrice: result.base_price.toString(),
        discountPercent: result.discount_percent.toString(),
        discountAmount: result.discount_amount.toString(),
        finalPrice: result.final_price.toString(),
        totalAmount: result.total_amount.toString(),
        currency: result.currency,
        pricingTier: result.pricing_tier || '',
        effectiveDate: result.effective_date,
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to calculate pricing',
      });
    }
  }

  private mapPricingToProto(pricing: any) {
    return {
      id: pricing.id,
      organizationId: pricing.organizationId || '',
      pricingCode: pricing.pricingCode,
      productId: pricing.productId || '',
      productCode: pricing.productCode || '',
      productName: pricing.productName || '',
      customerId: pricing.customerId || '',
      customerName: pricing.customerName || '',
      pricingType: pricing.pricingType,
      basePrice: pricing.basePrice.toString(),
      discountPercent: pricing.discountPercent.toString(),
      discountAmount: pricing.discountAmount.toString(),
      finalPrice: pricing.finalPrice.toString(),
      currency: pricing.currency,
      minimumQuantity: pricing.minimumQuantity.toString(),
      effectiveDate: pricing.effectiveDate instanceof Date
        ? pricing.effectiveDate.toISOString().split('T')[0]
        : (pricing.effectiveDate || ''),
      expiryDate: pricing.expiryDate instanceof Date
        ? pricing.expiryDate.toISOString().split('T')[0]
        : (pricing.expiryDate || ''),
      isActive: pricing.isActive,
      notes: pricing.notes || '',
    };
  }
}

