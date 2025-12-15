import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from './dto/pagination.dto';

export interface PaginatedProductsResult {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const existingProduct = await this.productRepository.findOneBy({
        sku: createProductDto.sku,
      });

      if (existingProduct) {
        throw new ConflictException(`Product with SKU ${createProductDto.sku} already exists`);
      }

      const product = this.productRepository.create(createProductDto);
      return await this.productRepository.save(product);
    } catch (error) {
      console.error('Error in ProductsService.create:', error);
      // Re-throw to let the gRPC controller handle it
      throw error;
    }
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedProductsResult> {
    const { page, limit, search, sort, status, category_id, type } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (status) {
      queryBuilder.where('product.status = :status', { status });
    }

    if (type) {
      const whereCondition = status ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('product.type = :type', { type });
    }

    if (category_id) {
      const whereCondition = status || type ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('product.categoryId = :category_id', { category_id });
    }

    if (search) {
      const whereCondition = status || type || category_id ? 'andWhere' : 'where';
      queryBuilder[whereCondition](
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Handle sorting
    if (sort) {
      const [field, order] = sort.split(':');
      queryBuilder.orderBy(`product.${field}`, order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');
    } else {
      queryBuilder.orderBy('product.createdAt', 'DESC');
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

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'kitComponents', 'kitComponents.componentProduct', 'alerts'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingProduct = await this.productRepository.findOneBy({
        sku: updateProductDto.sku,
      });

      if (existingProduct) {
        throw new ConflictException(`Product with SKU ${updateProductDto.sku} already exists`);
      }
    }

    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }
}

