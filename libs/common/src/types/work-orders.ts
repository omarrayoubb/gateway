export interface CreateWorkOrderRequest {
  title: string;
  ticketId: string;
  summary?: string;
  agent?: string;
  priority?: string;
  dueDate?: string;
  currency?: string;
  exchangeRate?: number;
  company?: string;
  contact?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  serviceAddress?: string;
  billingAddress?: string;
  termsAndConditions?: string;
  billingStatus?: string;
  installationBaseId?: string;
  parentWorkOrderId?: string;
  requestId?: string;
  createdBy?: string;
}

export interface UpdateWorkOrderRequest {
  id: string;
  title?: string;
  ticketId?: string;
  summary?: string;
  agent?: string;
  priority?: string;
  dueDate?: string;
  currency?: string;
  exchangeRate?: number;
  company?: string;
  contact?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  serviceAddress?: string;
  billingAddress?: string;
  termsAndConditions?: string;
  billingStatus?: string;
  installationBaseId?: string;
  parentWorkOrderId?: string;
  requestId?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneWorkOrderRequest {
  id: string;
}

export interface DeleteWorkOrderRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdateWorkOrderFields;
}

export interface UpdateWorkOrderFields {
  title?: string;
  ticketId?: string;
  summary?: string;
  agent?: string;
  priority?: string;
  dueDate?: string;
  currency?: string;
  exchangeRate?: number;
  company?: string;
  contact?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  serviceAddress?: string;
  billingAddress?: string;
  termsAndConditions?: string;
  billingStatus?: string;
  installationBaseId?: string;
  parentWorkOrderId?: string;
  requestId?: string;
}

export interface WorkOrderResponse {
  id: string;
  title: string;
  summary?: string;
  agent?: string;
  priority: string;
  dueDate?: string;
  currency?: string;
  exchangeRate?: number;
  company?: string;
  contact?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  serviceAddress?: string;
  billingAddress?: string;
  termsAndConditions?: string;
  billingStatus: string;
  ticketId: string;
  installationBaseId?: string;
  parentWorkOrderId?: string;
  requestId?: string;
  createdBy?: string;
  created_at: string;
  updated_at: string;
  servicesSubtotal?: number;
  partsSubtotal?: number;
  totalTax?: number;
  totalDiscount?: number;
  grandTotal?: number;
  workOrderServices?: WorkOrderServiceResponse[];
  workOrderParts?: WorkOrderPartResponse[];
  ticket?: TicketReference;
  installationBase?: PartReference;
}

export interface WorkOrderServiceResponse {
  workOrderId: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  discount: number;
  taxId?: string;
  taxPercentage?: number;
  amount: number;
}

export interface WorkOrderPartResponse {
  workOrderId: string;
  partId: string;
  partName: string;
  quantity: number;
  discount: number;
  taxId?: string;
  taxPercentage?: number;
  amount: number;
}

export interface TicketReference {
  id: string;
  subject: string;
}

export interface PartReference {
  id: string;
  name: string;
}

export interface PaginatedWorkOrdersResponse {
  data: WorkOrderResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteWorkOrderResponse {
  success: boolean;
  message?: string;
}

export interface BulkDeleteResponse {
  deleted_count: number;
  failed_ids?: FailedId[];
}

export interface FailedId {
  id: string;
  error: string;
}

export interface BulkUpdateResponse {
  updated_count: number;
  failed_items?: FailedItem[];
}

export interface FailedItem {
  id: string;
  error: string;
}

