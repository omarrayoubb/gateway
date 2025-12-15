import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Controller()
export class ProductCategoriesGrpcController {
  constructor(private readonly categoriesService: ProductCategoriesService) {}

  @GrpcMethod('ProductCategoriesService', 'GetProductCategory')
  async getProductCategory(data: { id: string }) {
    const category = await this.categoriesService.findOne(data.id);
    return this.mapCategoryToProto(category);
  }

  @GrpcMethod('ProductCategoriesService', 'GetProductCategories')
  async getProductCategories() {
    const categories = await this.categoriesService.findAll();
    return {
      categories: categories.map(category => this.mapCategoryToProto(category)),
    };
  }

  @GrpcMethod('ProductCategoriesService', 'CreateProductCategory')
  async createProductCategory(data: any) {
    const createDto: CreateProductCategoryDto = {
      name: data.name,
      description: data.description,
      parentId: data.parent_id,
    };
    const category = await this.categoriesService.create(createDto);
    return this.mapCategoryToProto(category);
  }

  @GrpcMethod('ProductCategoriesService', 'UpdateProductCategory')
  async updateProductCategory(data: any) {
    const updateDto: UpdateProductCategoryDto = {
      name: data.name,
      description: data.description,
      parentId: data.parent_id,
    };
    const category = await this.categoriesService.update(data.id, updateDto);
    return this.mapCategoryToProto(category);
  }

  @GrpcMethod('ProductCategoriesService', 'DeleteProductCategory')
  async deleteProductCategory(data: { id: string }) {
    await this.categoriesService.remove(data.id);
    return { success: true, message: 'Product category deleted successfully' };
  }

  private mapCategoryToProto(category: any) {
    return {
      id: category.id,
      name: category.name,
      description: category.description || '',
      parent_id: category.parentId || '',
      parent_name: category.parent?.name || '',
      created_at: category.createdAt?.toISOString() || '',
      updated_at: category.updatedAt?.toISOString() || '',
    };
  }
}

