import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorProduct } from './entities/vendor-product.entity';
import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';
import { VendorProductPaginationDto } from './dto/pagination.dto';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Product } from '../products/entities/product.entity';

export interface PaginatedVendorProductsResult {
  data: VendorProduct[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable()
export class VendorProductsService {
  constructor(
    @InjectRepository(VendorProduct)
    private vendorProductRepository: Repository<VendorProduct>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createVendorProductDto: CreateVendorProductDto): Promise<VendorProduct> {
    // Validate vendor exists
    const vendor = await this.vendorRepository.findOne({
      where: { id: createVendorProductDto.vendorId },
    });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${createVendorProductDto.vendorId} not found`);
    }

    // Validate product exists
    const product = await this.productRepository.findOne({
      where: { id: createVendorProductDto.productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${createVendorProductDto.productId} not found`);
    }

    const vendorProduct = this.vendorProductRepository.create(createVendorProductDto);
    return await this.vendorProductRepository.save(vendorProduct);
  }

  async findAll(paginationQuery: VendorProductPaginationDto): Promise<PaginatedVendorProductsResult> {
    const { page = 1, limit = 10, vendorId, productId, status, sort } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.vendorProductRepository
      .createQueryBuilder('vendorProduct')
      .leftJoinAndSelect('vendorProduct.vendor', 'vendor')
      .leftJoinAndSelect('vendorProduct.product', 'product');

    if (vendorId) {
      queryBuilder.where('vendorProduct.vendorId = :vendorId', { vendorId });
    }

    if (productId) {
      if (vendorId) {
        queryBuilder.andWhere('vendorProduct.productId = :productId', { productId });
      } else {
        queryBuilder.where('vendorProduct.productId = :productId', { productId });
      }
    }

    if (status) {
      const whereCondition = vendorId || productId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('vendorProduct.status = :status', { status });
    }

    // Handle sorting
    if (sort) {
      const [field, order] = sort.split(':');
      queryBuilder.orderBy(`vendorProduct.${field}`, order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');
    } else {
      queryBuilder.orderBy('vendorProduct.createdAt', 'DESC');
    }

    const [data, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
    };
  }

  async findOne(id: string): Promise<VendorProduct> {
    const vendorProduct = await this.vendorProductRepository.findOne({
      where: { id },
      relations: ['vendor', 'product'],
    });
    if (!vendorProduct) {
      throw new NotFoundException(`Vendor product with ID ${id} not found`);
    }
    return vendorProduct;
  }

  async update(id: string, updateVendorProductDto: UpdateVendorProductDto): Promise<VendorProduct> {
    const vendorProduct = await this.findOne(id);

    // Validate vendor if being updated
    if (updateVendorProductDto.vendorId && updateVendorProductDto.vendorId !== vendorProduct.vendorId) {
      const vendor = await this.vendorRepository.findOne({
        where: { id: updateVendorProductDto.vendorId },
      });
      if (!vendor) {
        throw new NotFoundException(`Vendor with ID ${updateVendorProductDto.vendorId} not found`);
      }
    }

    // Validate product if being updated
    if (updateVendorProductDto.productId && updateVendorProductDto.productId !== vendorProduct.productId) {
      const product = await this.productRepository.findOne({
        where: { id: updateVendorProductDto.productId },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${updateVendorProductDto.productId} not found`);
      }
    }

    Object.assign(vendorProduct, updateVendorProductDto);
    return await this.vendorProductRepository.save(vendorProduct);
  }

  async remove(id: string): Promise<void> {
    const vendorProduct = await this.findOne(id);
    await this.vendorProductRepository.remove(vendorProduct);
  }
}

