// Request Types
export interface CreateSalesOrderRequest {
  ownerId: string;
  subject: string;
  customerNo?: string;
  pending?: string;
  carrier?: string;
  salesCommission?: number;
  accountId: string;
  contactId?: string;
  dealId?: string;
  rfqId?: string;
  currency?: string;
  exchangeRate?: number;
  dueDate?: string;
  exciseDuty?: number;
  status?: string;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingCode?: string;
  billingCountry?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCode?: string;
  shippingCountry?: string;
  total?: number;
  subtotal?: number;
  discount?: number;
  adjustment?: number;
  grandtotal?: number;
  termsandcondition?: string;
  description?: string;
  products?: SalesOrderProductMessage[];
}

export interface UpdateSalesOrderRequest {
  id: string;
  ownerId?: string;
  subject?: string;
  customerNo?: string;
  pending?: string;
  carrier?: string;
  salesCommission?: number;
  accountId?: string;
  contactId?: string;
  dealId?: string;
  rfqId?: string;
  currency?: string;
  exchangeRate?: number;
  dueDate?: string;
  exciseDuty?: number;
  status?: string;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingCode?: string;
  billingCountry?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCode?: string;
  shippingCountry?: string;
  total?: number;
  subtotal?: number;
  discount?: number;
  adjustment?: number;
  grandtotal?: number;
  termsandcondition?: string;
  description?: string;
  products?: SalesOrderProductMessage[];
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneSalesOrderRequest {
  id: string;
}

export interface DeleteSalesOrderRequest {
  id: string;
}

export interface SalesOrderProductMessage {
  productId: string;
  listPrice: number;
  quantity: number;
  amount: number;
  discount?: number;
  tax?: number;
  total: number;
}

// Response Types
export interface SalesOrderProductResponse {
  id: string;
  productId: string;
  listPrice: number;
  quantity: number;
  amount: number;
  discount?: number;
  tax?: number;
  total: number;
}

export interface SalesOrderResponse {
  id: string;
  subject: string;
  customerNo?: string;
  pending?: string;
  carrier?: string;
  salesCommission?: number;
  accountId: string;
  accountName: string;
  contactId?: string;
  contactName?: string;
  dealId?: string;
  dealName?: string;
  rfqId?: string;
  rfqName?: string;
  currency: string;
  exchangeRate?: number;
  dueDate?: string;
  exciseDuty?: number;
  status: string;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingCode?: string;
  billingCountry?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCode?: string;
  shippingCountry?: string;
  total?: number;
  subtotal?: number;
  discount?: number;
  adjustment?: number;
  grandtotal?: number;
  termsandcondition?: string;
  description?: string;
  products?: SalesOrderProductResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSalesOrdersResponse {
  data: SalesOrderResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteSalesOrderResponse {
  success: boolean;
  message: string;
}

