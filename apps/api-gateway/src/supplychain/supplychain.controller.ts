import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupplyChainService } from './supplychain.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProductDto } from './dto/products/create-product.dto';
import { UpdateProductDto } from './dto/products/update-product.dto';
import { CreateProductCategoryDto } from './dto/product-categories/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/product-categories/update-product-category.dto';
import { UpdateProductAlertDto } from './dto/product-alerts/update-product-alert.dto';
import { CreateWarehouseDto } from './dto/warehouses/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/warehouses/update-warehouse.dto';
import { CreateInventoryBatchDto } from './dto/inventory-batches/create-inventory-batch.dto';
import { UpdateInventoryBatchDto } from './dto/inventory-batches/update-inventory-batch.dto';
import { CreateStockMovementDto } from './dto/stock-movements/create-stock-movement.dto';
import { CreateVendorDto } from './dto/vendors/create-vendor.dto';
import { UpdateVendorDto } from './dto/vendors/update-vendor.dto';
import { CreateVendorProductDto } from './dto/vendor-products/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/vendor-products/update-vendor-product.dto';
import { CreateVendorPerformanceDto } from './dto/vendor-performance/create-vendor-performance.dto';
import { UpdateVendorPerformanceDto } from './dto/vendor-performance/update-vendor-performance.dto';
import { CreateShipmentDto } from './dto/shipments/create-shipment.dto';
import { UpdateShipmentDto } from './dto/shipments/update-shipment.dto';
import { CreateShipmentTrackingDto } from './dto/shipment-tracking/create-shipment-tracking.dto';
import { UpdateShipmentTrackingDto } from './dto/shipment-tracking/update-shipment-tracking.dto';
import { CreatePurchaseOrderDto } from './dto/purchase-orders/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/purchase-orders/update-purchase-order.dto';
import { CreateDeliveryNoteDto } from './dto/delivery-notes/create-delivery-note.dto';
import { UpdateDeliveryNoteDto } from './dto/delivery-notes/update-delivery-note.dto';
import { UpdateStockMovementDto } from './dto/stock-movements/update-stock-movement.dto';

@Controller('supplychain')
// @UseGuards(JwtAuthGuard) // Temporarily disabled for development
export class SupplyChainController {
  constructor(private readonly supplyChainService: SupplyChainService) {}

  // ============================================
  // PRODUCTS ENDPOINTS
  // ============================================

  @Get('products')
  async getProducts(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('category_id') category_id?: string,
    @Query('type') type?: string,
  ) {
    // If no pagination specified, return all products (for dropdowns)
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : (page ? 10 : 1000); // Default to 1000 if no limit specified
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const response = await this.supplyChainService.getProducts(
      pageNum,
      limitNum,
      search || '',
      sort,
      status,
      category_id,
      type,
      token
    );
    console.log('Products API Gateway response:', JSON.stringify(response, null, 2));
    return response;
  }

  @Get('products/:id')
  async getProduct(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getProduct(id, token);
  }

  @Post('products')
  async createProduct(@Body() createProductDto: CreateProductDto, @Request() req: any) {
    try {
      // Convert numeric values to strings as required by gRPC proto
      const grpcData = {
        sku: createProductDto.sku,
        name: createProductDto.name,
        description: createProductDto.description || '',
        type: createProductDto.type,
        category_id: createProductDto.category_id || '',
        cost_price: createProductDto.cost_price?.toString() || '0',
        selling_price: createProductDto.selling_price?.toString() || '0',
        reorder_point: createProductDto.reorder_point?.toString() || '0',
        status: createProductDto.status || 'active',
        barcode: createProductDto.barcode || '',
        gtin: createProductDto.gtin || '',
        unit_of_measure: createProductDto.unit_of_measure || '',
        default_warehouse_id: createProductDto.default_warehouse_id || '',
        temperature: createProductDto.temperature || '',
      };
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.createProduct(grpcData, token);
    } catch (error) {
      // Map gRPC error codes to HTTP exceptions
      if (error.code === 6) {
        // ALREADY_EXISTS
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        // INVALID_ARGUMENT
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        // NOT_FOUND
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        // Other gRPC errors
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      // Re-throw if it's already an HTTP exception
      throw error;
    }
  }

  @Put('products/:id')
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: any,
  ) {
    const grpcData = Object.fromEntries(
      Object.entries(updateProductDto).filter(([_, v]) => v !== undefined)
    );
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.updateProduct(id, grpcData, token);
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.deleteProduct(id, token);
  }

  // ============================================
  // PRODUCT CATEGORIES ENDPOINTS
  // ============================================

  @Get('product-categories')
  async getProductCategories(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getProductCategories(pageNum, limitNum, sort, token);
  }

  @Get('product-categories/:id')
  async getProductCategory(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getProductCategory(id, token);
  }

  @Post('product-categories')
  async createProductCategory(
    @Body() createProductCategoryDto: CreateProductCategoryDto,
    @Request() req: any,
  ) {
    const grpcData = {
      name: createProductCategoryDto.name,
      description: createProductCategoryDto.description || '',
      parent_id: createProductCategoryDto.parent_id || '',
    };
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.createProductCategory(grpcData, token);
  }

  @Put('product-categories/:id')
  async updateProductCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
    @Request() req: any,
  ) {
    const grpcData = Object.fromEntries(
      Object.entries(updateProductCategoryDto).filter(([_, v]) => v !== undefined)
    );
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.updateProductCategory(id, grpcData, token);
  }

  @Delete('product-categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProductCategory(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.deleteProductCategory(id, token);
  }

  // ============================================
  // PRODUCT ALERTS ENDPOINTS
  // ============================================

  @Get('product-alerts')
  async getProductAlerts(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('product_id') product_id?: string,
    @Query('warehouse_id') warehouse_id?: string,
    @Query('severity') severity?: string,
    @Query('sort') sort?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getProductAlerts(
      pageNum,
      limitNum,
      status,
      product_id,
      warehouse_id,
      severity,
      sort,
      token
    );
  }

  @Get('product-alerts/:id')
  async getProductAlert(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getProductAlert(id, token);
  }

  @Put('product-alerts/:id')
  async updateProductAlert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductAlertDto: UpdateProductAlertDto,
    @Request() req: any,
  ) {
    const grpcData = {
      status: updateProductAlertDto.status,
      acknowledged_at: updateProductAlertDto.acknowledged_at || '',
      resolved_at: updateProductAlertDto.resolved_at || '',
    };
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.updateProductAlert(id, grpcData, token);
  }

  // ============================================
  // WAREHOUSES ENDPOINTS
  // ============================================

  @Get('warehouses')
  async getWarehouses(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('temperature_controlled') temperature_controlled?: string,
  ) {
    // If no pagination specified, return all warehouses (for dropdowns)
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : (page ? 10 : 1000); // Default to 1000 if no limit specified
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const response = await this.supplyChainService.getWarehouses(
      pageNum,
      limitNum,
      sort,
      status,
      temperature_controlled,
      token
    );
    console.log('Warehouses API Gateway response:', JSON.stringify(response, null, 2));
    return response;
  }

  @Get('warehouses/:id')
  async getWarehouse(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getWarehouse(id, token);
  }

  @Post('warehouses')
  async createWarehouse(
    @Body() createWarehouseDto: CreateWarehouseDto,
    @Request() req: any,
  ) {
    try {
      const grpcData = {
        name: createWarehouseDto.name,
        code: createWarehouseDto.code,
        address: createWarehouseDto.address || '',
        city: createWarehouseDto.city || '',
        country: createWarehouseDto.country || '',
        capacity: createWarehouseDto.capacity?.toString() || '0',
        status: createWarehouseDto.status || 'active',
        temperature_controlled: createWarehouseDto.temperature_controlled ? 'true' : 'false',
        min_temperature: createWarehouseDto.min_temperature?.toString() || '',
        max_temperature: createWarehouseDto.max_temperature?.toString() || '',
        contact_phone: createWarehouseDto.contact_phone || '',
        contact_email: createWarehouseDto.contact_email || '',
      };
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.createWarehouse(grpcData, token);
    } catch (error) {
      // Map gRPC error codes to HTTP exceptions
      if (error.code === 6) {
        // ALREADY_EXISTS
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        // INVALID_ARGUMENT
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        // NOT_FOUND
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        // Other gRPC errors
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Put('warehouses/:id')
  async updateWarehouse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
    @Request() req: any,
  ) {
    try {
      const grpcData = Object.fromEntries(
        Object.entries({
          name: updateWarehouseDto.name,
          code: updateWarehouseDto.code,
          address: updateWarehouseDto.address,
          city: updateWarehouseDto.city,
          country: updateWarehouseDto.country,
          capacity: updateWarehouseDto.capacity?.toString(),
          status: updateWarehouseDto.status,
          temperature_controlled: updateWarehouseDto.temperature_controlled !== undefined 
            ? (updateWarehouseDto.temperature_controlled ? 'true' : 'false') 
            : undefined,
          min_temperature: updateWarehouseDto.min_temperature?.toString(),
          max_temperature: updateWarehouseDto.max_temperature?.toString(),
          contact_phone: updateWarehouseDto.contact_phone,
          contact_email: updateWarehouseDto.contact_email,
        }).filter(([_, v]) => v !== undefined)
      );
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.updateWarehouse(id, grpcData, token);
    } catch (error) {
      // Map gRPC error codes to HTTP exceptions
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Delete('warehouses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWarehouse(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.deleteWarehouse(id, token);
    } catch (error) {
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // ============================================
  // INVENTORY BATCHES ENDPOINTS
  // ============================================

  @Get('inventory-batches')
  async getInventoryBatches(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('product_id') product_id?: string,
    @Query('warehouse_id') warehouse_id?: string,
    @Query('status') status?: string,
    @Query('batch_number') batch_number?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getInventoryBatches(
      pageNum,
      limitNum,
      sort,
      product_id,
      warehouse_id,
      status,
      batch_number,
      search,
      token
    );
  }

  @Get('inventory-batches/:id')
  async getInventoryBatch(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getInventoryBatch(id, token);
  }

  @Post('inventory-batches')
  async createInventoryBatch(
    @Body() createInventoryBatchDto: CreateInventoryBatchDto,
    @Request() req: any,
  ) {
    try {
      console.log('createInventoryBatchDto', createInventoryBatchDto.product_id);
      // Validate required fields
      if (!createInventoryBatchDto.product_id) {
        throw new BadRequestException('product_id is required');
      }
      if (!createInventoryBatchDto.warehouse_id) {
        throw new BadRequestException('warehouse_id is required');
      }
      if (!createInventoryBatchDto.batch_number) {
        throw new BadRequestException('batch_number is required');
      }
      
      // Convert to camelCase for gRPC (proto expects camelCase)
      const grpcData: any = {
        productId: createInventoryBatchDto.product_id,
        warehouseId: createInventoryBatchDto.warehouse_id,
        batchNumber: createInventoryBatchDto.batch_number,
        barcode: createInventoryBatchDto.barcode || '',
        quantityAvailable: createInventoryBatchDto.quantity_available?.toString() || '0',
        unitCost: createInventoryBatchDto.unit_cost?.toString() || '0',
        manufacturingDate: createInventoryBatchDto.manufacturing_date || '',
        expiryDate: createInventoryBatchDto.expiry_date || '',
        receivedDate: createInventoryBatchDto.received_date || '',
        location: createInventoryBatchDto.location || '',
        status: createInventoryBatchDto.status || 'available',
      };
      
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.createInventoryBatch(grpcData, token);
    } catch (error) {
      console.error('Error creating inventory batch:', error);
      // Map gRPC error codes to HTTP exceptions
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Put('inventory-batches/:id')
  async updateInventoryBatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInventoryBatchDto: UpdateInventoryBatchDto,
    @Request() req: any,
  ) {
    try {
      // Convert to camelCase for gRPC (proto expects camelCase)
      const grpcData = Object.fromEntries(
        Object.entries({
          productId: updateInventoryBatchDto.product_id,
          warehouseId: updateInventoryBatchDto.warehouse_id,
          batchNumber: updateInventoryBatchDto.batch_number,
          barcode: updateInventoryBatchDto.barcode,
          quantityAvailable: updateInventoryBatchDto.quantity_available?.toString(),
          unitCost: updateInventoryBatchDto.unit_cost?.toString(),
          manufacturingDate: updateInventoryBatchDto.manufacturing_date,
          expiryDate: updateInventoryBatchDto.expiry_date,
          receivedDate: updateInventoryBatchDto.received_date,
          location: updateInventoryBatchDto.location,
          status: updateInventoryBatchDto.status,
        }).filter(([_, v]) => v !== undefined)
      );
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.updateInventoryBatch(id, grpcData, token);
    } catch (error) {
      // Map gRPC error codes to HTTP exceptions
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Delete('inventory-batches/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInventoryBatch(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.deleteInventoryBatch(id, token);
    } catch (error) {
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // ============================================
  // STOCK MOVEMENTS ENDPOINTS
  // ============================================

  @Get('stock-movements')
  async getStockMovements(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('product_id') product_id?: string,
    @Query('batch_id') batch_id?: string,
    @Query('warehouse_id') warehouse_id?: string,
    @Query('movement_type') movement_type?: string,
    @Query('movement_date') movement_date?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : (page ? 10 : 1000); // Default to 1000 if no limit specified (for dashboard)
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const response = await this.supplyChainService.getStockMovements(
      pageNum,
      limitNum,
      sort,
      product_id,
      batch_id,
      warehouse_id,
      movement_type,
      movement_date,
      token
    );
    console.log('Stock movements API Gateway response:', JSON.stringify(response, null, 2));
    return response;
  }

  @Get('stock-movements/:id')
  async getStockMovement(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getStockMovement(id, token);
  }

  @Post('stock-movements')
  async createStockMovement(
    @Body() createStockMovementDto: CreateStockMovementDto,
    @Request() req: any,
  ) {
    try {
      // Validate required fields
      if (!createStockMovementDto.product_id) {
        throw new BadRequestException('product_id is required');
      }
      if (!createStockMovementDto.warehouse_id) {
        throw new BadRequestException('warehouse_id is required');
      }
      if (!createStockMovementDto.movement_type) {
        throw new BadRequestException('movement_type is required');
      }
      
      // Convert to camelCase for gRPC (proto expects camelCase)
      const grpcData: any = {
        productId: createStockMovementDto.product_id,
        batchId: createStockMovementDto.batch_id || '',
        warehouseId: createStockMovementDto.warehouse_id,
        movementType: createStockMovementDto.movement_type,
        quantity: createStockMovementDto.quantity?.toString() || '0',
        referenceType: createStockMovementDto.reference_type || '',
        referenceId: createStockMovementDto.reference_id || '',
        movementDate: createStockMovementDto.movement_date || '',
        notes: createStockMovementDto.notes || '',
        userId: createStockMovementDto.user_id || '',
      };
      
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.createStockMovement(grpcData, token);
    } catch (error) {
      console.error('Error creating stock movement:', error);
      // Map gRPC error codes to HTTP exceptions
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Put('stock-movements/:id')
  async updateStockMovement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStockMovementDto: UpdateStockMovementDto,
    @Request() req: any,
  ) {
    try {
      // Convert to camelCase for gRPC (proto expects camelCase)
      const grpcData = Object.fromEntries(
        Object.entries({
          productId: updateStockMovementDto.product_id,
          batchId: updateStockMovementDto.batch_id,
          warehouseId: updateStockMovementDto.warehouse_id,
          movementType: updateStockMovementDto.movement_type,
          quantity: updateStockMovementDto.quantity?.toString(),
          referenceType: updateStockMovementDto.reference_type,
          referenceId: updateStockMovementDto.reference_id,
          movementDate: updateStockMovementDto.movement_date,
          notes: updateStockMovementDto.notes,
          userId: updateStockMovementDto.user_id,
        }).filter(([_, v]) => v !== undefined)
      );
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.updateStockMovement(id, grpcData, token);
    } catch (error) {
      // Map gRPC error codes to HTTP exceptions
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Delete('stock-movements/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteStockMovement(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.deleteStockMovement(id, token);
    } catch (error) {
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  // ============================================
  // VENDORS ENDPOINTS
  // ============================================

  @Get('vendors')
  async getVendors(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getVendors(
      pageNum,
      limitNum,
      sort,
      status,
      search,
      token
    );
  }

  @Get('vendors/:id')
  async getVendor(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getVendor(id, token);
  }

  @Post('vendors')
  async createVendor(
    @Body() createVendorDto: CreateVendorDto,
    @Request() req: any,
  ) {
    try {
      // Convert to camelCase for gRPC
      const grpcData: any = {
        name: createVendorDto.name,
        code: createVendorDto.code,
        contactPerson: createVendorDto.contact_person || '',
        email: createVendorDto.email || '',
        phone: createVendorDto.phone || '',
        address: createVendorDto.address || '',
        city: createVendorDto.city || '',
        country: createVendorDto.country || '',
        taxId: createVendorDto.tax_id || '',
        paymentTerms: createVendorDto.payment_terms || '',
        currency: createVendorDto.currency || 'USD',
        status: createVendorDto.status || 'active',
        rating: createVendorDto.rating?.toString() || '',
        notes: createVendorDto.notes || '',
      };
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.createVendor(grpcData, token);
    } catch (error) {
      console.error('Error creating vendor:', error);
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Put('vendors/:id')
  async updateVendor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVendorDto: UpdateVendorDto,
    @Request() req: any,
  ) {
    try {
      const grpcData: any = {};
      if (updateVendorDto.name !== undefined) grpcData.name = updateVendorDto.name;
      if (updateVendorDto.code !== undefined) grpcData.code = updateVendorDto.code;
      if (updateVendorDto.contact_person !== undefined) grpcData.contactPerson = updateVendorDto.contact_person;
      if (updateVendorDto.email !== undefined) grpcData.email = updateVendorDto.email;
      if (updateVendorDto.phone !== undefined) grpcData.phone = updateVendorDto.phone;
      if (updateVendorDto.address !== undefined) grpcData.address = updateVendorDto.address;
      if (updateVendorDto.city !== undefined) grpcData.city = updateVendorDto.city;
      if (updateVendorDto.country !== undefined) grpcData.country = updateVendorDto.country;
      if (updateVendorDto.tax_id !== undefined) grpcData.taxId = updateVendorDto.tax_id;
      if (updateVendorDto.payment_terms !== undefined) grpcData.paymentTerms = updateVendorDto.payment_terms;
      if (updateVendorDto.currency !== undefined) grpcData.currency = updateVendorDto.currency;
      if (updateVendorDto.status !== undefined) grpcData.status = updateVendorDto.status;
      if (updateVendorDto.rating !== undefined) grpcData.rating = updateVendorDto.rating.toString();
      if (updateVendorDto.notes !== undefined) grpcData.notes = updateVendorDto.notes;
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.updateVendor(id, grpcData, token);
    } catch (error) {
      console.error('Error updating vendor:', error);
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Delete('vendors/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVendor(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.deleteVendor(id, token);
  }

  // ============================================
  // VENDOR PRODUCTS ENDPOINTS
  // ============================================

  @Get('vendor-products')
  async getVendorProducts(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('vendor_id') vendor_id?: string,
    @Query('product_id') product_id?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getVendorProducts(
      pageNum,
      limitNum,
      vendor_id,
      product_id,
      status,
      sort,
      token
    );
  }

  @Get('vendor-products/:id')
  async getVendorProduct(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getVendorProduct(id, token);
  }

  @Post('vendor-products')
  async createVendorProduct(
    @Body() createVendorProductDto: CreateVendorProductDto,
    @Request() req: any,
  ) {
    try {
      const grpcData: any = {
        vendorId: createVendorProductDto.vendor_id,
        productId: createVendorProductDto.product_id,
        vendorSku: createVendorProductDto.vendor_sku || '',
        unitPrice: createVendorProductDto.unit_price.toString(),
        minimumOrderQuantity: createVendorProductDto.minimum_order_quantity?.toString() || '1',
        leadTimeDays: createVendorProductDto.lead_time_days?.toString() || '',
        status: createVendorProductDto.status || 'active',
        priceTiers: createVendorProductDto.price_tiers ? JSON.stringify(createVendorProductDto.price_tiers.map(tier => ({ minQuantity: tier.min_quantity, price: tier.price }))) : '',
      };
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.createVendorProduct(grpcData, token);
    } catch (error) {
      console.error('Error creating vendor product:', error);
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Put('vendor-products/:id')
  async updateVendorProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVendorProductDto: UpdateVendorProductDto,
    @Request() req: any,
  ) {
    try {
      const grpcData: any = {};
      if (updateVendorProductDto.vendor_id !== undefined) grpcData.vendorId = updateVendorProductDto.vendor_id;
      if (updateVendorProductDto.product_id !== undefined) grpcData.productId = updateVendorProductDto.product_id;
      if (updateVendorProductDto.vendor_sku !== undefined) grpcData.vendorSku = updateVendorProductDto.vendor_sku;
      if (updateVendorProductDto.unit_price !== undefined) grpcData.unitPrice = updateVendorProductDto.unit_price.toString();
      if (updateVendorProductDto.minimum_order_quantity !== undefined) grpcData.minimumOrderQuantity = updateVendorProductDto.minimum_order_quantity.toString();
      if (updateVendorProductDto.lead_time_days !== undefined) grpcData.leadTimeDays = updateVendorProductDto.lead_time_days.toString();
      if (updateVendorProductDto.status !== undefined) grpcData.status = updateVendorProductDto.status;
      if (updateVendorProductDto.price_tiers !== undefined) {
        grpcData.priceTiers = JSON.stringify(updateVendorProductDto.price_tiers.map(tier => ({ minQuantity: tier.min_quantity, price: tier.price })));
      }
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.updateVendorProduct(id, grpcData, token);
    } catch (error) {
      console.error('Error updating vendor product:', error);
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Delete('vendor-products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVendorProduct(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.deleteVendorProduct(id, token);
  }

  // ============================================
  // VENDOR PERFORMANCE ENDPOINTS
  // ============================================

  @Get('vendor-performance')
  async getVendorPerformances(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('vendor_id') vendor_id?: string,
    @Query('sort') sort?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getVendorPerformances(
      pageNum,
      limitNum,
      vendor_id,
      sort,
      token
    );
  }

  @Get('vendor-performance/:id')
  async getVendorPerformance(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getVendorPerformance(id, token);
  }

  @Post('vendor-performance')
  async createVendorPerformance(
    @Body() createVendorPerformanceDto: CreateVendorPerformanceDto,
    @Request() req: any,
  ) {
    try {
      const grpcData: any = {
        vendorId: createVendorPerformanceDto.vendor_id,
        periodStart: createVendorPerformanceDto.period_start,
        periodEnd: createVendorPerformanceDto.period_end,
        onTimeDeliveryRate: createVendorPerformanceDto.on_time_delivery_rate?.toString() || '',
        qualityScore: createVendorPerformanceDto.quality_score?.toString() || '',
        totalOrders: createVendorPerformanceDto.total_orders?.toString() || '0',
        totalAmount: createVendorPerformanceDto.total_amount?.toString() || '0',
      };
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.createVendorPerformance(grpcData, token);
    } catch (error) {
      console.error('Error creating vendor performance:', error);
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Put('vendor-performance/:id')
  async updateVendorPerformance(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVendorPerformanceDto: UpdateVendorPerformanceDto,
    @Request() req: any,
  ) {
    try {
      const grpcData: any = {};
      if (updateVendorPerformanceDto.vendor_id !== undefined) grpcData.vendorId = updateVendorPerformanceDto.vendor_id;
      if (updateVendorPerformanceDto.period_start !== undefined) grpcData.periodStart = updateVendorPerformanceDto.period_start;
      if (updateVendorPerformanceDto.period_end !== undefined) grpcData.periodEnd = updateVendorPerformanceDto.period_end;
      if (updateVendorPerformanceDto.on_time_delivery_rate !== undefined) grpcData.onTimeDeliveryRate = updateVendorPerformanceDto.on_time_delivery_rate.toString();
      if (updateVendorPerformanceDto.quality_score !== undefined) grpcData.qualityScore = updateVendorPerformanceDto.quality_score.toString();
      if (updateVendorPerformanceDto.total_orders !== undefined) grpcData.totalOrders = updateVendorPerformanceDto.total_orders.toString();
      if (updateVendorPerformanceDto.total_amount !== undefined) grpcData.totalAmount = updateVendorPerformanceDto.total_amount.toString();
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.updateVendorPerformance(id, grpcData, token);
    } catch (error) {
      console.error('Error updating vendor performance:', error);
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Delete('vendor-performance/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVendorPerformance(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.deleteVendorPerformance(id, token);
  }

  // ============================================
  // SHIPMENTS ENDPOINTS
  // ============================================

  @Get('shipments')
  async getShipments(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('warehouse_id') warehouse_id?: string,
    @Query('shipment_date') shipment_date?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getShipments(
      pageNum,
      limitNum,
      sort,
      status,
      type,
      warehouse_id,
      shipment_date,
      token
    );
  }

  @Get('shipments/:id')
  async getShipment(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getShipment(id, token);
  }

  @Post('shipments')
  async createShipment(
    @Body() createShipmentDto: CreateShipmentDto,
    @Request() req: any,
  ) {
    try {
      // Convert to camelCase for gRPC
      // Helper function to convert empty strings to undefined for optional UUIDs
      const toOptionalUuid = (value: string | undefined): string | undefined => {
        return value && value.trim() !== '' ? value : undefined;
      };
      
      const grpcData: any = {
        shipmentNumber: createShipmentDto.shipment_number,
        type: createShipmentDto.type,
        warehouseId: createShipmentDto.warehouse_id,
        toWarehouseId: toOptionalUuid(createShipmentDto.to_warehouse_id),
        vendorId: toOptionalUuid(createShipmentDto.vendor_id),
        customerName: createShipmentDto.customer_name || '',
        trackingNumber: createShipmentDto.tracking_number || '',
        carrier: createShipmentDto.carrier || '',
        shipmentDate: createShipmentDto.shipment_date,
        expectedDelivery: createShipmentDto.expected_delivery || '',
        status: createShipmentDto.status || 'pending',
        items: createShipmentDto.items.map(item => ({
          productId: item.product_id,
          batchId: toOptionalUuid(item.batch_id),
          quantity: item.quantity.toString(),
        })),
        notes: createShipmentDto.notes || '',
      };
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.createShipment(grpcData, token);
    } catch (error) {
      console.error('Error creating shipment:', error);
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Put('shipments/:id')
  async updateShipment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShipmentDto: UpdateShipmentDto,
    @Request() req: any,
  ) {
    try {
      // Helper function to convert empty strings to undefined for optional UUIDs
      const toOptionalUuid = (value: string | undefined): string | undefined => {
        return value && value.trim() !== '' ? value : undefined;
      };

      const grpcData: any = {};
      if (updateShipmentDto.shipment_number !== undefined) grpcData.shipmentNumber = updateShipmentDto.shipment_number;
      if (updateShipmentDto.type !== undefined) grpcData.type = updateShipmentDto.type;
      if (updateShipmentDto.warehouse_id !== undefined) grpcData.warehouseId = updateShipmentDto.warehouse_id;
      if (updateShipmentDto.to_warehouse_id !== undefined) grpcData.toWarehouseId = toOptionalUuid(updateShipmentDto.to_warehouse_id);
      if (updateShipmentDto.vendor_id !== undefined) grpcData.vendorId = toOptionalUuid(updateShipmentDto.vendor_id);
      if (updateShipmentDto.customer_name !== undefined) grpcData.customerName = updateShipmentDto.customer_name || '';
      if (updateShipmentDto.tracking_number !== undefined) grpcData.trackingNumber = updateShipmentDto.tracking_number || '';
      if (updateShipmentDto.carrier !== undefined) grpcData.carrier = updateShipmentDto.carrier || '';
      if (updateShipmentDto.shipment_date !== undefined) grpcData.shipmentDate = updateShipmentDto.shipment_date;
      if (updateShipmentDto.expected_delivery !== undefined) grpcData.expectedDelivery = updateShipmentDto.expected_delivery || '';
      if (updateShipmentDto.status !== undefined) grpcData.status = updateShipmentDto.status;
      if (updateShipmentDto.items !== undefined) {
        grpcData.items = updateShipmentDto.items.map(item => ({
          productId: item.product_id,
          batchId: toOptionalUuid(item.batch_id),
          quantity: item.quantity.toString(),
        }));
      }
      if (updateShipmentDto.notes !== undefined) grpcData.notes = updateShipmentDto.notes || '';
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.updateShipment(id, grpcData, token);
    } catch (error) {
      console.error('Error updating shipment:', error);
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Delete('shipments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteShipment(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.deleteShipment(id, token);
  }

  // ============================================
  // SHIPMENT TRACKING ENDPOINTS
  // ============================================

  @Get('shipment-tracking')
  async getShipmentTrackings(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('shipment_id') shipment_id?: string,
    @Query('sort') sort?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getShipmentTrackings(
      pageNum,
      limitNum,
      shipment_id,
      sort,
      token
    );
  }

  @Get('shipment-tracking/:id')
  async getShipmentTracking(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getShipmentTracking(id, token);
  }

  @Post('shipment-tracking')
  async createShipmentTracking(
    @Body() createShipmentTrackingDto: CreateShipmentTrackingDto,
    @Request() req: any,
  ) {
    try {
      const grpcData: any = {
        shipmentId: createShipmentTrackingDto.shipment_id,
        status: createShipmentTrackingDto.status,
        location: createShipmentTrackingDto.location || '',
        description: createShipmentTrackingDto.description || '',
        timestamp: createShipmentTrackingDto.timestamp || new Date().toISOString(),
        updatedBy: createShipmentTrackingDto.updated_by || 'manual',
        isAutomated: createShipmentTrackingDto.is_automated ? 'true' : 'false',
      };
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.createShipmentTracking(grpcData, token);
    } catch (error) {
      console.error('Error creating shipment tracking:', error);
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Put('shipment-tracking/:id')
  async updateShipmentTracking(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShipmentTrackingDto: UpdateShipmentTrackingDto,
    @Request() req: any,
  ) {
    try {
      const grpcData: any = {};
      if (updateShipmentTrackingDto.shipment_id !== undefined) grpcData.shipmentId = updateShipmentTrackingDto.shipment_id;
      if (updateShipmentTrackingDto.status !== undefined) grpcData.status = updateShipmentTrackingDto.status;
      if (updateShipmentTrackingDto.location !== undefined) grpcData.location = updateShipmentTrackingDto.location || '';
      if (updateShipmentTrackingDto.description !== undefined) grpcData.description = updateShipmentTrackingDto.description || '';
      if (updateShipmentTrackingDto.timestamp !== undefined) grpcData.timestamp = updateShipmentTrackingDto.timestamp;
      if (updateShipmentTrackingDto.updated_by !== undefined) grpcData.updatedBy = updateShipmentTrackingDto.updated_by;
      if (updateShipmentTrackingDto.is_automated !== undefined) grpcData.isAutomated = updateShipmentTrackingDto.is_automated ? 'true' : 'false';
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.updateShipmentTracking(id, grpcData, token);
    } catch (error) {
      console.error('Error updating shipment tracking:', error);
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Delete('shipment-tracking/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteShipmentTracking(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.deleteShipmentTracking(id, token);
  }

  // ============================================
  // PURCHASE ORDERS ENDPOINTS
  // ============================================

  @Get('purchase-orders')
  async getPurchaseOrders(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('vendor_id') vendor_id?: string,
    @Query('warehouse_id') warehouse_id?: string,
    @Query('order_date') order_date?: string,
  ) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.getPurchaseOrders(
        pageNum,
        limitNum,
        sort,
        status,
        vendor_id,
        warehouse_id,
        order_date,
        token
      );
    } catch (error) {
      console.error('Error getting purchase orders:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('purchase-orders/:id')
  async getPurchaseOrder(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.getPurchaseOrder(id, token);
  }

  @Post('purchase-orders')
  async createPurchaseOrder(
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto,
    @Request() req: any,
  ) {
    try {
      const grpcData: any = {
        poNumber: createPurchaseOrderDto.po_number,
        vendorId: createPurchaseOrderDto.vendor_id,
        warehouseId: createPurchaseOrderDto.warehouse_id,
        orderDate: createPurchaseOrderDto.order_date,
        expectedDeliveryDate: createPurchaseOrderDto.expected_delivery_date || '',
        items: createPurchaseOrderDto.items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          total: item.total,
        })),
        subtotal: createPurchaseOrderDto.subtotal,
        tax: createPurchaseOrderDto.tax,
        totalAmount: createPurchaseOrderDto.total_amount,
        status: createPurchaseOrderDto.status || 'draft',
        notes: createPurchaseOrderDto.notes || '',
      };
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.createPurchaseOrder(grpcData, token);
    } catch (error) {
      console.error('Error creating purchase order:', error);
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Put('purchase-orders/:id')
  async updatePurchaseOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
    @Request() req: any,
  ) {
    try {
      const grpcData: any = {};
      if (updatePurchaseOrderDto.po_number !== undefined) grpcData.poNumber = updatePurchaseOrderDto.po_number;
      if (updatePurchaseOrderDto.vendor_id !== undefined) grpcData.vendorId = updatePurchaseOrderDto.vendor_id;
      if (updatePurchaseOrderDto.warehouse_id !== undefined) grpcData.warehouseId = updatePurchaseOrderDto.warehouse_id;
      if (updatePurchaseOrderDto.order_date !== undefined) grpcData.orderDate = updatePurchaseOrderDto.order_date;
      if (updatePurchaseOrderDto.expected_delivery_date !== undefined) grpcData.expectedDeliveryDate = updatePurchaseOrderDto.expected_delivery_date || '';
      if (updatePurchaseOrderDto.items !== undefined) {
        grpcData.items = updatePurchaseOrderDto.items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          total: item.total,
        }));
      }
      if (updatePurchaseOrderDto.subtotal !== undefined) grpcData.subtotal = updatePurchaseOrderDto.subtotal;
      if (updatePurchaseOrderDto.tax !== undefined) grpcData.tax = updatePurchaseOrderDto.tax;
      if (updatePurchaseOrderDto.total_amount !== undefined) grpcData.totalAmount = updatePurchaseOrderDto.total_amount;
      if (updatePurchaseOrderDto.status !== undefined) grpcData.status = updatePurchaseOrderDto.status;
      if (updatePurchaseOrderDto.notes !== undefined) grpcData.notes = updatePurchaseOrderDto.notes || '';
      if (updatePurchaseOrderDto.approval_status !== undefined) grpcData.approvalStatus = updatePurchaseOrderDto.approval_status;
      if (updatePurchaseOrderDto.requires_approval !== undefined) grpcData.requiresApproval = updatePurchaseOrderDto.requires_approval;
      if (updatePurchaseOrderDto.submitted_for_approval_by !== undefined) grpcData.submittedForApprovalBy = updatePurchaseOrderDto.submitted_for_approval_by;
      if (updatePurchaseOrderDto.submitted_for_approval_at !== undefined) grpcData.submittedForApprovalAt = updatePurchaseOrderDto.submitted_for_approval_at;
      if (updatePurchaseOrderDto.approved_by !== undefined) grpcData.approvedBy = updatePurchaseOrderDto.approved_by;
      if (updatePurchaseOrderDto.approved_at !== undefined) grpcData.approvedAt = updatePurchaseOrderDto.approved_at;
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.updatePurchaseOrder(id, grpcData, token);
    } catch (error) {
      console.error('Error updating purchase order:', error);
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Delete('purchase-orders/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePurchaseOrder(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.supplyChainService.deletePurchaseOrder(id, token);
  }

  // ============================================
  // DELIVERY NOTES ENDPOINTS
  // ============================================

  @Get('delivery-notes')
  async getDeliveryNotes(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('delivered_to') delivered_to?: string,
    @Query('date') date?: string,
  ) {
    try {
      // Convert offset to page if provided
      const limitNum = limit ? parseInt(limit) : 50;
      const offsetNum = offset ? parseInt(offset) : 0;
      const pageNum = page ? parseInt(page) : Math.floor(offsetNum / limitNum) + 1;
      
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      const response = await this.supplyChainService.getDeliveryNotes(
        pageNum,
        limitNum,
        sort,
        status,
        delivered_to,
        date,
        token
      );
      
      // Return response with delivery_notes key as specified
      return {
        delivery_notes: response.deliveryNotes || [],
        total: response.total || 0,
        page: response.page || pageNum,
        limit: response.limit || limitNum,
      };
    } catch (error) {
      console.error('Error getting delivery notes:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('delivery-notes/:id')
  async getDeliveryNote(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.getDeliveryNote(id, token);
    } catch (error) {
      console.error('Error getting delivery note:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Post('delivery-notes')
  async createDeliveryNote(
    @Body() createDeliveryNoteDto: CreateDeliveryNoteDto,
    @Request() req: any,
  ) {
    try {
      const grpcData: any = {
        dnNumber: createDeliveryNoteDto.dn_number,
        deliveredTo: createDeliveryNoteDto.delivered_to,
        date: createDeliveryNoteDto.date,
        taxCard: createDeliveryNoteDto.tax_card || '',
        cr: createDeliveryNoteDto.cr || '',
        items: createDeliveryNoteDto.items.map(item => ({
          productId: item.product_id,
          batchId: item.batch_id || '',
          quantity: item.quantity,
        })),
      };
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.createDeliveryNote(grpcData, token);
    } catch (error) {
      console.error('Error creating delivery note:', error);
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Put('delivery-notes/:id')
  async updateDeliveryNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDeliveryNoteDto: UpdateDeliveryNoteDto,
    @Request() req: any,
  ) {
    try {
      const grpcData: any = {};
      if (updateDeliveryNoteDto.dn_number !== undefined) grpcData.dnNumber = updateDeliveryNoteDto.dn_number;
      if (updateDeliveryNoteDto.delivered_to !== undefined) grpcData.deliveredTo = updateDeliveryNoteDto.delivered_to;
      if (updateDeliveryNoteDto.date !== undefined) grpcData.date = updateDeliveryNoteDto.date;
      if (updateDeliveryNoteDto.tax_card !== undefined) grpcData.taxCard = updateDeliveryNoteDto.tax_card || '';
      if (updateDeliveryNoteDto.cr !== undefined) grpcData.cr = updateDeliveryNoteDto.cr || '';
      if (updateDeliveryNoteDto.items !== undefined) {
        grpcData.items = updateDeliveryNoteDto.items.map(item => ({
          productId: item.product_id,
          batchId: item.batch_id || '',
          quantity: item.quantity,
        }));
      }
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.updateDeliveryNote(id, grpcData, token);
    } catch (error) {
      console.error('Error updating delivery note:', error);
      if (error.code === 6) {
        throw new ConflictException(error.details || error.message || 'Resource already exists');
      } else if (error.code === 3) {
        throw new BadRequestException(error.details || error.message || 'Invalid request');
      } else if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Delete('delivery-notes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeliveryNote(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.deleteDeliveryNote(id, token);
    } catch (error) {
      console.error('Error deleting delivery note:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }

  @Get('delivery-notes/products/with-inventory')
  async getProductsWithInventory(
    @Query('warehouse_id') warehouse_id?: string,
    @Request() req: any,
  ) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      return await this.supplyChainService.getProductsWithInventory(warehouse_id, token);
    } catch (error) {
      console.error('Error getting products with inventory:', error);
      if (error.code === 5) {
        throw new NotFoundException(error.details || error.message || 'Resource not found');
      } else if (error.code) {
        throw new BadRequestException(error.details || error.message || 'Request failed');
      }
      throw error;
    }
  }
}

