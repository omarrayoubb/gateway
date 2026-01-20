import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Pricing } from './entities/pricing.entity';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { PricingPaginationDto } from './dto/pagination.dto';
import { CalculatePricingDto } from './dto/calculate-pricing.dto';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Pricing)
    private readonly pricingRepository: Repository<Pricing>,
  ) {}

  async create(createDto: CreatePricingDto): Promise<Pricing> {
    // Convert empty string to null for organizationId
    const organizationId = createDto.organization_id && createDto.organization_id.trim() !== '' 
      ? createDto.organization_id 
      : null;

    // Auto-generate pricing code if not provided
    let pricingCode = createDto.pricing_code;
    if (!pricingCode || pricingCode.trim() === '') {
      pricingCode = await this.generatePricingCode(organizationId);
    }

    // Check for duplicate pricing code
    const existing = await this.pricingRepository.findOne({
      where: {
        pricingCode: pricingCode,
        organizationId: organizationId === null ? IsNull() : organizationId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Pricing with code ${pricingCode} already exists`,
      );
    }

    // Calculate final price
    const basePrice = createDto.base_price || 0;
    const discountPercent = createDto.discount_percent || 0;
    const discountAmount = createDto.discount_amount || 0;
    
    // If discount_percent is provided, calculate discount_amount
    let finalDiscountAmount = discountAmount;
    if (discountPercent > 0 && discountAmount === 0) {
      finalDiscountAmount = (basePrice * discountPercent) / 100;
    }
    
    const finalPrice = basePrice - finalDiscountAmount;

    const pricing = this.pricingRepository.create({
      organizationId,
      pricingCode: pricingCode,
      productId: createDto.product_id,
      customerId: createDto.customer_id || null,
      pricingType: createDto.pricing_type,
      basePrice,
      discountPercent,
      discountAmount: finalDiscountAmount,
      finalPrice,
      currency: createDto.currency || 'USD',
      minimumQuantity: createDto.minimum_quantity || 0,
      effectiveDate: new Date(createDto.effective_date),
      expiryDate: createDto.expiry_date ? new Date(createDto.expiry_date) : null,
      isActive: createDto.is_active !== undefined ? createDto.is_active : true,
      notes: createDto.notes,
    });

    try {
      return await this.pricingRepository.save(pricing);
    } catch (error) {
      console.error('Error saving pricing to database:', error);
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new BadRequestException(
          `Pricing with code ${pricingCode} already exists`,
        );
      }
      throw error;
    }
  }

  private async generatePricingCode(organizationId: string | null): Promise<string> {
    const prefix = 'PRC';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const queryBuilder = this.pricingRepository
      .createQueryBuilder('pricing')
      .where('pricing.pricingCode LIKE :pattern', { pattern: `${prefix}-${year}${month}-%` });

    if (organizationId) {
      queryBuilder.andWhere('pricing.organizationId = :organizationId', { organizationId });
    } else {
      queryBuilder.andWhere('pricing.organizationId IS NULL');
    }

    queryBuilder.orderBy('pricing.pricingCode', 'DESC').limit(1);

    const lastPricing = await queryBuilder.getOne();

    let sequence = 1;
    if (lastPricing && lastPricing.pricingCode) {
      const parts = lastPricing.pricingCode.split('-');
      if (parts.length === 3) {
        const lastSequence = parseInt(parts[2]);
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }
    }

    return `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  async findAll(paginationDto: PricingPaginationDto): Promise<Pricing[]> {
    const where: any = {};

    if (paginationDto.product_id) {
      where.productId = paginationDto.product_id;
    }

    if (paginationDto.customer_id) {
      where.customerId = paginationDto.customer_id;
    }

    if (paginationDto.is_active !== undefined) {
      where.isActive = paginationDto.is_active;
    }

    if (paginationDto.effective_date) {
      const effectiveDate = new Date(paginationDto.effective_date);
      where.effectiveDate = LessThanOrEqual(effectiveDate);
      where.expiryDate = MoreThanOrEqual(effectiveDate);
    }

    const queryBuilder = this.pricingRepository.createQueryBuilder('pricing').where(where);

    if (paginationDto.sort) {
      let sortField = paginationDto.sort.trim();
      let sortOrder: 'ASC' | 'DESC' = 'ASC';

      if (sortField.startsWith('-')) {
        sortField = sortField.substring(1).trim();
        sortOrder = 'DESC';
      } else if (sortField.includes(':')) {
        const [field, order] = sortField.split(':');
        sortField = field.trim();
        sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      }

      const mappedField = this.mapSortField(sortField);
      const validSortFields = ['pricingCode', 'pricingType', 'basePrice', 'finalPrice', 'effectiveDate', 'expiryDate', 'createdAt', 'updatedAt'];
      if (validSortFields.includes(mappedField)) {
        queryBuilder.orderBy(`pricing.${mappedField}`, sortOrder);
      } else {
        queryBuilder.orderBy('pricing.createdAt', 'DESC');
      }
    } else {
      queryBuilder.orderBy('pricing.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Pricing> {
    const pricing = await this.pricingRepository.findOne({
      where: { id },
    });

    if (!pricing) {
      throw new NotFoundException(`Pricing with ID ${id} not found`);
    }

    return pricing;
  }

  async update(id: string, updateDto: UpdatePricingDto): Promise<Pricing> {
    const pricing = await this.findOne(id);

    if (updateDto.pricing_code && updateDto.pricing_code !== pricing.pricingCode) {
      const existing = await this.pricingRepository.findOne({
        where: { pricingCode: updateDto.pricing_code },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Pricing with code ${updateDto.pricing_code} already exists`,
        );
      }
    }

    // Recalculate final price if price fields are updated
    let basePrice = pricing.basePrice;
    let discountPercent = pricing.discountPercent;
    let discountAmount = pricing.discountAmount;

    if (updateDto.base_price !== undefined) {
      basePrice = updateDto.base_price;
    }
    if (updateDto.discount_percent !== undefined) {
      discountPercent = updateDto.discount_percent;
    }
    if (updateDto.discount_amount !== undefined) {
      discountAmount = updateDto.discount_amount;
    }

    // If discount_percent is provided, calculate discount_amount
    let finalDiscountAmount = discountAmount;
    if (discountPercent > 0 && discountAmount === 0 && updateDto.discount_amount === undefined) {
      finalDiscountAmount = (basePrice * discountPercent) / 100;
    }

    const finalPrice = basePrice - finalDiscountAmount;

    Object.assign(pricing, {
      ...(updateDto.pricing_code && { pricingCode: updateDto.pricing_code }),
      ...(updateDto.product_id && { productId: updateDto.product_id }),
      ...(updateDto.customer_id !== undefined && { customerId: updateDto.customer_id || null }),
      ...(updateDto.pricing_type && { pricingType: updateDto.pricing_type }),
      ...(updateDto.base_price !== undefined && { basePrice }),
      ...(updateDto.discount_percent !== undefined && { discountPercent }),
      ...(updateDto.discount_amount !== undefined && { discountAmount: finalDiscountAmount }),
      ...(updateDto.base_price !== undefined || updateDto.discount_percent !== undefined || updateDto.discount_amount !== undefined ? { finalPrice } : {}),
      ...(updateDto.currency && { currency: updateDto.currency }),
      ...(updateDto.minimum_quantity !== undefined && { minimumQuantity: updateDto.minimum_quantity }),
      ...(updateDto.effective_date && { effectiveDate: new Date(updateDto.effective_date) }),
      ...(updateDto.expiry_date !== undefined && { expiryDate: updateDto.expiry_date ? new Date(updateDto.expiry_date) : null }),
      ...(updateDto.is_active !== undefined && { isActive: updateDto.is_active }),
      ...(updateDto.notes !== undefined && { notes: updateDto.notes }),
    });

    return await this.pricingRepository.save(pricing);
  }

  async remove(id: string): Promise<void> {
    const pricing = await this.findOne(id);
    await this.pricingRepository.remove(pricing);
  }

  async calculate(calculateDto: CalculatePricingDto): Promise<any> {
    const { product_id, customer_id, quantity, date } = calculateDto;
    const effectiveDate = date ? new Date(date) : new Date();

    // Build query to find matching pricing rules
    const queryBuilder = this.pricingRepository
      .createQueryBuilder('pricing')
      .where('pricing.productId = :productId', { productId: product_id })
      .andWhere('pricing.isActive = :isActive', { isActive: true })
      .andWhere('pricing.effectiveDate <= :effectiveDate', { effectiveDate })
      .andWhere('(pricing.expiryDate IS NULL OR pricing.expiryDate >= :effectiveDate)', { effectiveDate })
      .andWhere('pricing.minimumQuantity <= :quantity', { quantity });

    // Prioritize customer-specific pricing, then general pricing
    if (customer_id) {
      queryBuilder
        .andWhere('(pricing.customerId = :customerId OR pricing.customerId IS NULL)', { customerId: customer_id })
        .orderBy('CASE WHEN pricing.customerId IS NOT NULL THEN 0 ELSE 1 END', 'ASC');
    } else {
      queryBuilder.andWhere('pricing.customerId IS NULL');
    }

    // Order by pricing type priority and minimum quantity (higher quantity tiers first)
    queryBuilder
      .addOrderBy('pricing.minimumQuantity', 'DESC')
      .addOrderBy('pricing.createdAt', 'DESC');

    const matchingPricing = await queryBuilder.getOne();

    if (!matchingPricing) {
      throw new NotFoundException(
        `No active pricing rule found for product ${product_id} with quantity ${quantity}`,
      );
    }

    // Calculate pricing
    const basePrice = parseFloat(matchingPricing.basePrice.toString());
    const discountPercent = parseFloat(matchingPricing.discountPercent.toString());
    const discountAmount = parseFloat(matchingPricing.discountAmount.toString());
    
    // Calculate discount if only percent is provided
    let finalDiscountAmount = discountAmount;
    if (discountPercent > 0 && discountAmount === 0) {
      finalDiscountAmount = (basePrice * discountPercent) / 100;
    }

    const finalPrice = basePrice - finalDiscountAmount;
    const totalAmount = finalPrice * quantity;

    return {
      product_id: matchingPricing.productId,
      product_code: matchingPricing.productCode,
      product_name: matchingPricing.productName,
      customer_id: matchingPricing.customerId,
      customer_name: matchingPricing.customerName,
      quantity,
      base_price: basePrice,
      discount_percent: discountPercent,
      discount_amount: finalDiscountAmount,
      final_price: finalPrice,
      total_amount: totalAmount,
      currency: matchingPricing.currency,
      pricing_tier: matchingPricing.pricingTier,
      effective_date: matchingPricing.effectiveDate instanceof Date
        ? matchingPricing.effectiveDate.toISOString().split('T')[0]
        : (matchingPricing.effectiveDate || ''),
    };
  }

  private mapSortField(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'pricing_code': 'pricingCode',
      'pricing_type': 'pricingType',
      'base_price': 'basePrice',
      'final_price': 'finalPrice',
      'effective_date': 'effectiveDate',
      'expiry_date': 'expiryDate',
      'created_at': 'createdAt',
    };

    return fieldMap[field] || field;
  }
}

