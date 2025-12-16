import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

interface ProductsService {
  GetProduct(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetProducts(data: { page?: number; limit?: number; search?: string; sort?: string; status?: string; category_id?: string; type?: string }, metadata?: Metadata): Observable<any>;
  CreateProduct(data: any, metadata?: Metadata): Observable<any>;
  UpdateProduct(data: any, metadata?: Metadata): Observable<any>;
  DeleteProduct(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface ProductCategoriesService {
  GetProductCategory(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetProductCategories(data: { page?: number; limit?: number; sort?: string }, metadata?: Metadata): Observable<any>;
  CreateProductCategory(data: any, metadata?: Metadata): Observable<any>;
  UpdateProductCategory(data: any, metadata?: Metadata): Observable<any>;
  DeleteProductCategory(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface ProductAlertsService {
  GetProductAlert(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetProductAlerts(data: { page?: number; limit?: number; status?: string; product_id?: string; warehouse_id?: string; severity?: string; sort?: string }, metadata?: Metadata): Observable<any>;
  UpdateProductAlert(data: any, metadata?: Metadata): Observable<any>;
}

interface WarehousesService {
  GetWarehouse(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetWarehouses(data: { page?: number; limit?: number; sort?: string; status?: string; temperature_controlled?: string }, metadata?: Metadata): Observable<any>;
  CreateWarehouse(data: any, metadata?: Metadata): Observable<any>;
  UpdateWarehouse(data: any, metadata?: Metadata): Observable<any>;
  DeleteWarehouse(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface InventoryBatchesService {
  GetInventoryBatch(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetInventoryBatches(data: { page?: number; limit?: number; sort?: string; productId?: string; warehouseId?: string; status?: string; batchNumber?: string; search?: string }, metadata?: Metadata): Observable<any>;
  CreateInventoryBatch(data: any, metadata?: Metadata): Observable<any>;
  UpdateInventoryBatch(data: any, metadata?: Metadata): Observable<any>;
  DeleteInventoryBatch(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface StockMovementsService {
  GetStockMovement(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetStockMovements(data: { page?: number; limit?: number; sort?: string; productId?: string; batchId?: string; warehouseId?: string; movementType?: string; movementDate?: string }, metadata?: Metadata): Observable<any>;
  CreateStockMovement(data: any, metadata?: Metadata): Observable<any>;
  UpdateStockMovement(data: any, metadata?: Metadata): Observable<any>;
  DeleteStockMovement(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface VendorsService {
  GetVendor(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetVendors(data: { page?: number; limit?: number; sort?: string; status?: string; search?: string }, metadata?: Metadata): Observable<any>;
  CreateVendor(data: any, metadata?: Metadata): Observable<any>;
  UpdateVendor(data: any, metadata?: Metadata): Observable<any>;
  DeleteVendor(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface VendorProductsService {
  GetVendorProduct(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetVendorProducts(data: { page?: number; limit?: number; vendorId?: string; productId?: string; status?: string; sort?: string }, metadata?: Metadata): Observable<any>;
  CreateVendorProduct(data: any, metadata?: Metadata): Observable<any>;
  UpdateVendorProduct(data: any, metadata?: Metadata): Observable<any>;
  DeleteVendorProduct(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface VendorPerformanceService {
  GetVendorPerformance(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetVendorPerformances(data: { page?: number; limit?: number; vendorId?: string; sort?: string }, metadata?: Metadata): Observable<any>;
  CreateVendorPerformance(data: any, metadata?: Metadata): Observable<any>;
  UpdateVendorPerformance(data: any, metadata?: Metadata): Observable<any>;
  DeleteVendorPerformance(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface ShipmentsService {
  GetShipment(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetShipments(data: { page?: number; limit?: number; sort?: string; status?: string; type?: string; warehouseId?: string; shipmentDate?: string }, metadata?: Metadata): Observable<any>;
  CreateShipment(data: any, metadata?: Metadata): Observable<any>;
  UpdateShipment(data: any, metadata?: Metadata): Observable<any>;
  DeleteShipment(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface ShipmentTrackingService {
  GetShipmentTracking(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetShipmentTrackings(data: { page?: number; limit?: number; shipmentId?: string; sort?: string }, metadata?: Metadata): Observable<any>;
  CreateShipmentTracking(data: any, metadata?: Metadata): Observable<any>;
  UpdateShipmentTracking(data: any, metadata?: Metadata): Observable<any>;
  DeleteShipmentTracking(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface PurchaseOrdersService {
  GetPurchaseOrder(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetPurchaseOrders(data: { page?: number; limit?: number; sort?: string; status?: string; vendorId?: string; warehouseId?: string; orderDate?: string }, metadata?: Metadata): Observable<any>;
  CreatePurchaseOrder(data: any, metadata?: Metadata): Observable<any>;
  UpdatePurchaseOrder(data: any, metadata?: Metadata): Observable<any>;
  DeletePurchaseOrder(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface DeliveryNotesService {
  GetDeliveryNote(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetDeliveryNotes(data: { page?: number; limit?: number; sort?: string; status?: string; deliveredTo?: string; date?: string }, metadata?: Metadata): Observable<any>;
  CreateDeliveryNote(data: any, metadata?: Metadata): Observable<any>;
  UpdateDeliveryNote(data: any, metadata?: Metadata): Observable<any>;
  DeleteDeliveryNote(data: { id: string }, metadata?: Metadata): Observable<any>;
  GetProductsWithInventory(data: { warehouseId?: string }, metadata?: Metadata): Observable<any>;
}

interface ContactsGrpcService {
  findAllContacts(data: { page: number; limit: number }, metadata?: Metadata): Observable<any>;
  findOneContact(data: { id: string }, metadata?: Metadata): Observable<any>;
}

interface AccountsGrpcService {
  findAllAccounts(data: { page: number; limit: number }, metadata?: Metadata): Observable<any>;
  findOneAccount(data: { id: string }, metadata?: Metadata): Observable<any>;
}

@Injectable()
export class SupplyChainService implements OnModuleInit {
  private productsService: ProductsService;
  private productCategoriesService: ProductCategoriesService;
  private productAlertsService: ProductAlertsService;
  private warehousesService: WarehousesService;
  private inventoryBatchesService: InventoryBatchesService;
  private stockMovementsService: StockMovementsService;
  private vendorsService: VendorsService;
  private vendorProductsService: VendorProductsService;
  private vendorPerformanceService: VendorPerformanceService;
  private shipmentsService: ShipmentsService;
  private shipmentTrackingService: ShipmentTrackingService;
  private purchaseOrdersService: PurchaseOrdersService;
  private deliveryNotesService: DeliveryNotesService;
  private contactsService: ContactsGrpcService;
  private accountsService: AccountsGrpcService;

  constructor(
    @Inject('SUPPLYCHAIN_PACKAGE') private readonly client: ClientGrpc,
    @Inject('CRM_PACKAGE') private readonly crmClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.productsService = this.client.getService<ProductsService>('ProductsService');
    this.productCategoriesService = this.client.getService<ProductCategoriesService>('ProductCategoriesService');
    this.productAlertsService = this.client.getService<ProductAlertsService>('ProductAlertsService');
    this.warehousesService = this.client.getService<WarehousesService>('WarehousesService');
    this.inventoryBatchesService = this.client.getService<InventoryBatchesService>('InventoryBatchesService');
    this.stockMovementsService = this.client.getService<StockMovementsService>('StockMovementsService');
    this.vendorsService = this.client.getService<VendorsService>('VendorsService');
    this.vendorProductsService = this.client.getService<VendorProductsService>('VendorProductsService');
    this.vendorPerformanceService = this.client.getService<VendorPerformanceService>('VendorPerformanceService');
    this.shipmentsService = this.client.getService<ShipmentsService>('ShipmentsService');
    this.shipmentTrackingService = this.client.getService<ShipmentTrackingService>('ShipmentTrackingService');
    this.purchaseOrdersService = this.client.getService<PurchaseOrdersService>('PurchaseOrdersService');
    this.deliveryNotesService = this.client.getService<DeliveryNotesService>('DeliveryNotesService');
    this.contactsService = this.crmClient.getService<ContactsGrpcService>('ContactsService');
    this.accountsService = this.crmClient.getService<AccountsGrpcService>('AccountsService');
  }

  private createMetadata(token?: string): Metadata {
    const metadata = new Metadata();
    if (token) {
      metadata.add('authorization', `Bearer ${token}`);
    }
    return metadata;
  }

  // Products methods
  async getProducts(page = 1, limit = 10, search = '', sort?: string, status?: string, category_id?: string, type?: string, token?: string) {
    try {
      const response = await firstValueFrom(
        this.productsService.GetProducts(
          { page, limit, search, sort, status, category_id, type },
          this.createMetadata(token)
        )
      );
      console.log('Products response from gRPC:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error('gRPC Error getting products:', error);
      throw error;
    }
  }

  async getProduct(id: string, token?: string) {
    return await firstValueFrom(
      this.productsService.GetProduct({ id }, this.createMetadata(token))
    );
  }

  async createProduct(data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.productsService.CreateProduct(data, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, data: any, token?: string) {
    return await firstValueFrom(
      this.productsService.UpdateProduct({ id, ...data }, this.createMetadata(token))
    );
  }

  async deleteProduct(id: string, token?: string) {
    return await firstValueFrom(
      this.productsService.DeleteProduct({ id }, this.createMetadata(token))
    );
  }

  // Product Categories methods
  async getProductCategories(page = 1, limit = 10, sort?: string, token?: string) {
    return await firstValueFrom(
      this.productCategoriesService.GetProductCategories(
        { page, limit, sort },
        this.createMetadata(token)
      )
    );
  }

  async getProductCategory(id: string, token?: string) {
    return await firstValueFrom(
      this.productCategoriesService.GetProductCategory({ id }, this.createMetadata(token))
    );
  }

  async createProductCategory(data: any, token?: string) {
    return await firstValueFrom(
      this.productCategoriesService.CreateProductCategory(data, this.createMetadata(token))
    );
  }

  async updateProductCategory(id: string, data: any, token?: string) {
    return await firstValueFrom(
      this.productCategoriesService.UpdateProductCategory({ id, ...data }, this.createMetadata(token))
    );
  }

  async deleteProductCategory(id: string, token?: string) {
    return await firstValueFrom(
      this.productCategoriesService.DeleteProductCategory({ id }, this.createMetadata(token))
    );
  }

  // Product Alerts methods
  async getProductAlerts(page = 1, limit = 10, status?: string, product_id?: string, warehouse_id?: string, severity?: string, sort?: string, token?: string) {
    return await firstValueFrom(
      this.productAlertsService.GetProductAlerts(
        { page, limit, status, product_id, warehouse_id, severity, sort },
        this.createMetadata(token)
      )
    );
  }

  async getProductAlert(id: string, token?: string) {
    return await firstValueFrom(
      this.productAlertsService.GetProductAlert({ id }, this.createMetadata(token))
    );
  }

  async updateProductAlert(id: string, data: any, token?: string) {
    return await firstValueFrom(
      this.productAlertsService.UpdateProductAlert({ id, ...data }, this.createMetadata(token))
    );
  }

  // Warehouses methods
  async getWarehouses(page = 1, limit = 10, sort?: string, status?: string, temperature_controlled?: string, token?: string) {
    try {
      const response = await firstValueFrom(
        this.warehousesService.GetWarehouses(
          { page, limit, sort, status, temperature_controlled },
          this.createMetadata(token)
        )
      );
      console.log('Warehouses response from gRPC:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error('gRPC Error getting warehouses:', error);
      throw error;
    }
  }

  async getWarehouse(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.warehousesService.GetWarehouse({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting warehouse:', error);
      throw error;
    }
  }

  async createWarehouse(data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.warehousesService.CreateWarehouse(data, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error creating warehouse:', error);
      throw error;
    }
  }

  async updateWarehouse(id: string, data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.warehousesService.UpdateWarehouse({ id, ...data }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error updating warehouse:', error);
      throw error;
    }
  }

  async deleteWarehouse(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.warehousesService.DeleteWarehouse({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error deleting warehouse:', error);
      throw error;
    }
  }

  // Inventory Batches methods
  async getInventoryBatches(page = 1, limit = 10, sort?: string, product_id?: string, warehouse_id?: string, status?: string, batch_number?: string, search?: string, token?: string) {
    try {
      // Convert to camelCase for gRPC (proto expects camelCase)
      return await firstValueFrom(
        this.inventoryBatchesService.GetInventoryBatches(
          { 
            page, 
            limit, 
            sort, 
            productId: product_id, 
            warehouseId: warehouse_id, 
            status, 
            batchNumber: batch_number, 
            search 
          },
          this.createMetadata(token)
        )
      );
    } catch (error) {
      console.error('gRPC Error getting inventory batches:', error);
      throw error;
    }
  }

  async getInventoryBatch(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.inventoryBatchesService.GetInventoryBatch({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting inventory batch:', error);
      throw error;
    }
  }

  async createInventoryBatch(data: any, token?: string) {
    try {
      console.log('Creating inventory batch with data:', JSON.stringify(data, null, 2));
      const result = await firstValueFrom(
        this.inventoryBatchesService.CreateInventoryBatch(data, this.createMetadata(token))
      );
      console.log('Inventory batch created successfully:', result);
      return result;
    } catch (error) {
      console.error('gRPC Error creating inventory batch:', error);
      throw error;
    }
  }

  async updateInventoryBatch(id: string, data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.inventoryBatchesService.UpdateInventoryBatch({ id, ...data }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error updating inventory batch:', error);
      throw error;
    }
  }

  async deleteInventoryBatch(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.inventoryBatchesService.DeleteInventoryBatch({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error deleting inventory batch:', error);
      throw error;
    }
  }

  // Stock Movements methods
  async getStockMovements(page = 1, limit = 10, sort?: string, product_id?: string, batch_id?: string, warehouse_id?: string, movement_type?: string, movement_date?: string, token?: string) {
    try {
      // Convert to camelCase for gRPC (proto expects camelCase)
      const response = await firstValueFrom(
        this.stockMovementsService.GetStockMovements(
          { 
            page, 
            limit, 
            sort, 
            productId: product_id, 
            batchId: batch_id,
            warehouseId: warehouse_id, 
            movementType: movement_type,
            movementDate: movement_date,
          },
          this.createMetadata(token)
        )
      );
      console.log('Stock movements response from gRPC:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error('gRPC Error getting stock movements:', error);
      throw error;
    }
  }

  async getStockMovement(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.stockMovementsService.GetStockMovement({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting stock movement:', error);
      throw error;
    }
  }

  async createStockMovement(data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.stockMovementsService.CreateStockMovement(data, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error creating stock movement:', error);
      throw error;
    }
  }

  async updateStockMovement(id: string, data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.stockMovementsService.UpdateStockMovement({ id, ...data }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error updating stock movement:', error);
      throw error;
    }
  }

  async deleteStockMovement(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.stockMovementsService.DeleteStockMovement({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error deleting stock movement:', error);
      throw error;
    }
  }

  // Vendors methods
  async getVendors(page = 1, limit = 10, sort?: string, status?: string, search?: string, token?: string) {
    try {
      return await firstValueFrom(
        this.vendorsService.GetVendors(
          { page, limit, sort, status, search },
          this.createMetadata(token)
        )
      );
    } catch (error) {
      console.error('gRPC Error getting vendors:', error);
      throw error;
    }
  }

  async getVendor(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.vendorsService.GetVendor({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting vendor:', error);
      throw error;
    }
  }

  async createVendor(data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.vendorsService.CreateVendor(data, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error creating vendor:', error);
      throw error;
    }
  }

  async updateVendor(id: string, data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.vendorsService.UpdateVendor({ id, ...data }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error updating vendor:', error);
      throw error;
    }
  }

  async deleteVendor(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.vendorsService.DeleteVendor({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error deleting vendor:', error);
      throw error;
    }
  }

  // Vendor Products methods
  async getVendorProducts(page = 1, limit = 10, vendor_id?: string, product_id?: string, status?: string, sort?: string, token?: string) {
    try {
      return await firstValueFrom(
        this.vendorProductsService.GetVendorProducts(
          { page, limit, vendorId: vendor_id, productId: product_id, status, sort },
          this.createMetadata(token)
        )
      );
    } catch (error) {
      console.error('gRPC Error getting vendor products:', error);
      throw error;
    }
  }

  async getVendorProduct(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.vendorProductsService.GetVendorProduct({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting vendor product:', error);
      throw error;
    }
  }

  async createVendorProduct(data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.vendorProductsService.CreateVendorProduct(data, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error creating vendor product:', error);
      throw error;
    }
  }

  async updateVendorProduct(id: string, data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.vendorProductsService.UpdateVendorProduct({ id, ...data }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error updating vendor product:', error);
      throw error;
    }
  }

  async deleteVendorProduct(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.vendorProductsService.DeleteVendorProduct({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error deleting vendor product:', error);
      throw error;
    }
  }

  // Vendor Performance methods
  async getVendorPerformances(page = 1, limit = 10, vendor_id?: string, sort?: string, token?: string) {
    try {
      return await firstValueFrom(
        this.vendorPerformanceService.GetVendorPerformances(
          { page, limit, vendorId: vendor_id, sort },
          this.createMetadata(token)
        )
      );
    } catch (error) {
      console.error('gRPC Error getting vendor performances:', error);
      throw error;
    }
  }

  async getVendorPerformance(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.vendorPerformanceService.GetVendorPerformance({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting vendor performance:', error);
      throw error;
    }
  }

  async createVendorPerformance(data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.vendorPerformanceService.CreateVendorPerformance(data, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error creating vendor performance:', error);
      throw error;
    }
  }

  async updateVendorPerformance(id: string, data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.vendorPerformanceService.UpdateVendorPerformance({ id, ...data }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error updating vendor performance:', error);
      throw error;
    }
  }

  async deleteVendorPerformance(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.vendorPerformanceService.DeleteVendorPerformance({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error deleting vendor performance:', error);
      throw error;
    }
  }

  // Shipments methods
  async getShipments(page = 1, limit = 10, sort?: string, status?: string, type?: string, warehouse_id?: string, shipment_date?: string, token?: string) {
    try {
      return await firstValueFrom(
        this.shipmentsService.GetShipments(
          { page, limit, sort, status, type, warehouseId: warehouse_id, shipmentDate: shipment_date },
          this.createMetadata(token)
        )
      );
    } catch (error) {
      console.error('gRPC Error getting shipments:', error);
      throw error;
    }
  }

  async getShipment(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.shipmentsService.GetShipment({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting shipment:', error);
      throw error;
    }
  }

  async createShipment(data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.shipmentsService.CreateShipment(data, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error creating shipment:', error);
      throw error;
    }
  }

  async updateShipment(id: string, data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.shipmentsService.UpdateShipment({ id, ...data }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error updating shipment:', error);
      throw error;
    }
  }

  async deleteShipment(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.shipmentsService.DeleteShipment({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error deleting shipment:', error);
      throw error;
    }
  }

  // Shipment Tracking methods
  async getShipmentTrackings(page = 1, limit = 10, shipment_id?: string, sort?: string, token?: string) {
    try {
      return await firstValueFrom(
        this.shipmentTrackingService.GetShipmentTrackings(
          { page, limit, shipmentId: shipment_id, sort },
          this.createMetadata(token)
        )
      );
    } catch (error) {
      console.error('gRPC Error getting shipment trackings:', error);
      throw error;
    }
  }

  async getShipmentTracking(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.shipmentTrackingService.GetShipmentTracking({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting shipment tracking:', error);
      throw error;
    }
  }

  async createShipmentTracking(data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.shipmentTrackingService.CreateShipmentTracking(data, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error creating shipment tracking:', error);
      throw error;
    }
  }

  async updateShipmentTracking(id: string, data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.shipmentTrackingService.UpdateShipmentTracking({ id, ...data }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error updating shipment tracking:', error);
      throw error;
    }
  }

  async deleteShipmentTracking(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.shipmentTrackingService.DeleteShipmentTracking({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error deleting shipment tracking:', error);
      throw error;
    }
  }

  // Purchase Orders methods
  async getPurchaseOrders(page = 1, limit = 10, sort?: string, status?: string, vendor_id?: string, warehouse_id?: string, order_date?: string, token?: string) {
    try {
      return await firstValueFrom(
        this.purchaseOrdersService.GetPurchaseOrders(
          { page, limit, sort, status, vendorId: vendor_id, warehouseId: warehouse_id, orderDate: order_date },
          this.createMetadata(token)
        )
      );
    } catch (error) {
      console.error('gRPC Error getting purchase orders:', error);
      throw error;
    }
  }

  async getPurchaseOrder(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.purchaseOrdersService.GetPurchaseOrder({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting purchase order:', error);
      throw error;
    }
  }

  async createPurchaseOrder(data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.purchaseOrdersService.CreatePurchaseOrder(data, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error creating purchase order:', error);
      throw error;
    }
  }

  async updatePurchaseOrder(id: string, data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.purchaseOrdersService.UpdatePurchaseOrder({ id, ...data }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error updating purchase order:', error);
      throw error;
    }
  }

  async deletePurchaseOrder(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.purchaseOrdersService.DeletePurchaseOrder({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error deleting purchase order:', error);
      throw error;
    }
  }

  // Delivery Notes methods
  async getDeliveryNotes(page = 1, limit = 50, sort?: string, status?: string, delivered_to?: string, date?: string, token?: string) {
    try {
      return await firstValueFrom(
        this.deliveryNotesService.GetDeliveryNotes(
          { page, limit, sort, status, deliveredTo: delivered_to, date },
          this.createMetadata(token)
        )
      );
    } catch (error) {
      console.error('gRPC Error getting delivery notes:', error);
      throw error;
    }
  }

  async getDeliveryNote(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.deliveryNotesService.GetDeliveryNote({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting delivery note:', error);
      throw error;
    }
  }

  async createDeliveryNote(data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.deliveryNotesService.CreateDeliveryNote(data, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error creating delivery note:', error);
      throw error;
    }
  }

  async updateDeliveryNote(id: string, data: any, token?: string) {
    try {
      return await firstValueFrom(
        this.deliveryNotesService.UpdateDeliveryNote({ id, ...data }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error updating delivery note:', error);
      throw error;
    }
  }

  async deleteDeliveryNote(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.deliveryNotesService.DeleteDeliveryNote({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error deleting delivery note:', error);
      throw error;
    }
  }

  async getProductsWithInventory(warehouse_id?: string, token?: string) {
    try {
      return await firstValueFrom(
        this.deliveryNotesService.GetProductsWithInventory({ warehouseId: warehouse_id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting products with inventory:', error);
      throw error;
    }
  }

  // ============================================
  // CRM CONTACTS ENDPOINTS
  // ============================================

  async getContacts(page = 1, limit = 10, token?: string) {
    try {
      return await firstValueFrom(
        this.contactsService.findAllContacts({ page, limit }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting contacts:', error);
      throw error;
    }
  }

  async getContact(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.contactsService.findOneContact({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting contact:', error);
      throw error;
    }
  }

  // ============================================
  // CRM ACCOUNTS ENDPOINTS
  // ============================================

  async getAccounts(page = 1, limit = 10, token?: string) {
    try {
      return await firstValueFrom(
        this.accountsService.findAllAccounts({ page, limit }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting accounts:', error);
      throw error;
    }
  }

  async getAccount(id: string, token?: string) {
    try {
      return await firstValueFrom(
        this.accountsService.findOneAccount({ id }, this.createMetadata(token))
      );
    } catch (error) {
      console.error('gRPC Error getting account:', error);
      throw error;
    }
  }
}

