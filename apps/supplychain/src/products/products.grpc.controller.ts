import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductType, ProductStatus, ProductTemperature } from './entities/product.entity';

@Controller()
export class ProductsGrpcController {
  constructor(private readonly productsService: ProductsService) {}

  @GrpcMethod('ProductsService', 'GetProduct')
  async getProduct(data: { id: string }) {
    try {
      const product = await this.productsService.findOne(data.id);
      return this.mapProductToProto(product);
    } catch (error) {
      throw new RpcException({
        code: error.status === 404 ? 5 : 2, // NOT_FOUND : UNKNOWN
        message: error.message || 'Failed to get product',
      });
    }
  }

  @GrpcMethod('ProductsService', 'GetProducts')
  async getProducts(data: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    sort?: string; 
    status?: string; 
    category_id?: string; 
    type?: string; 
  }) {
    try {
      const page = data.page || 1;
      const limit = data.limit || 10;
      const result = await this.productsService.findAll({ 
        page, 
        limit, 
        search: data.search || '',
        sort: data.sort,
        status: data.status,
        category_id: data.category_id,
        type: data.type,
      });
      console.log('GetProducts result:', {
        total: result.total,
        page: result.page,
        limit: result.limit,
        dataCount: result.data.length,
      });
      return {
        products: result.data.map(product => this.mapProductToProto(product)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      console.error('Error in GetProducts gRPC method:', error);
      throw new RpcException({
        code: 2, // UNKNOWN
        message: error.message || 'Failed to get products',
      });
    }
  }

  @GrpcMethod('ProductsService', 'CreateProduct')
  async createProduct(data: any) {
    try {
      console.log('CreateProduct received data:', JSON.stringify(data, null, 2));
      
      const createDto: CreateProductDto = {
        sku: data.sku,
        name: data.name,
        description: data.description || undefined,
        type: data.type || ProductType.SINGLE,
        categoryId: data.category_id || undefined,
        costPrice: data.cost_price ? parseFloat(data.cost_price) : 0,
        sellingPrice: data.selling_price ? parseFloat(data.selling_price) : 0,
        reorderPoint: data.reorder_point ? parseInt(data.reorder_point) : 0,
        status: data.status || ProductStatus.ACTIVE,
        barcode: data.barcode || undefined,
        gtin: data.gtin || undefined,
        unitOfMeasure: data.unit_of_measure || undefined,
        defaultWarehouseId: data.default_warehouse_id || undefined,
        temperature: data.temperature || undefined,
      };
      
      console.log('CreateProduct DTO:', JSON.stringify(createDto, null, 2));
      
      const product = await this.productsService.create(createDto);
      return this.mapProductToProto(product);
    } catch (error) {
      console.error('CreateProduct error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
        stack: error.stack,
        code: error.code,
        detail: error.detail,
      });
      
      const code = error.status === 409 ? 6 : error.status === 400 ? 3 : 2; // ALREADY_EXISTS : INVALID_ARGUMENT : UNKNOWN
      const errorMessage = error.message || error.detail || 'Failed to create product';
      
      throw new RpcException({
        code,
        message: errorMessage,
      });
    }
  }

  @GrpcMethod('ProductsService', 'UpdateProduct')
  async updateProduct(data: any) {
    try {
      const updateDto: UpdateProductDto = {
        sku: data.sku,
        name: data.name,
        description: data.description,
        type: data.type,
        categoryId: data.category_id,
        costPrice: data.cost_price,
        sellingPrice: data.selling_price,
        reorderPoint: data.reorder_point,
        status: data.status,
        barcode: data.barcode,
        gtin: data.gtin,
        unitOfMeasure: data.unit_of_measure,
        defaultWarehouseId: data.default_warehouse_id,
        temperature: data.temperature,
      };
      const product = await this.productsService.update(data.id, updateDto);
      return this.mapProductToProto(product);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 409 ? 6 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update product',
      });
    }
  }

  @GrpcMethod('ProductsService', 'DeleteProduct')
  async deleteProduct(data: { id: string }) {
    try {
      await this.productsService.remove(data.id);
      return { success: true, message: 'Product deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2; // NOT_FOUND : UNKNOWN
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete product',
      });
    }
  }

  private mapProductToProto(product: any) {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      type: product.type,
      category_id: product.categoryId || '',
      category_name: product.category?.name || '',
      cost_price: product.costPrice?.toString() || '0',
      selling_price: product.sellingPrice?.toString() || '0',
      reorder_point: product.reorderPoint?.toString() || '0',
      status: product.status,
      barcode: product.barcode || '',
      gtin: product.gtin || '',
      unit_of_measure: product.unitOfMeasure || '',
      default_warehouse_id: product.defaultWarehouseId || '',
      temperature: product.temperature || '',
      created_at: product.createdAt?.toISOString() || '',
      updated_at: product.updatedAt?.toISOString() || '',
    };
  }
}

