export interface CreateTicketRequest {
  contactName?: string;
  accountName?: string;
  email?: string;
  phone?: string;
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  classification?: string;
  ticketOwner?: string;
  productName?: string;
  vendor?: string;
  serialNumber?: string;
  dateTime1?: string;
  channel?: string;
  language?: string;
  category?: string;
  subcategory?: string;
  dueDate?: string;
}

export interface UpdateTicketRequest {
  id: string;
  contactName?: string;
  accountName?: string;
  email?: string;
  phone?: string;
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  classification?: string;
  ticketOwner?: string;
  productName?: string;
  vendor?: string;
  serialNumber?: string;
  dateTime1?: string;
  channel?: string;
  language?: string;
  category?: string;
  subcategory?: string;
  dueDate?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneTicketRequest {
  id: string;
}

export interface DeleteTicketRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdateTicketFields;
}

export interface UpdateTicketFields {
  contactName?: string;
  accountName?: string;
  email?: string;
  phone?: string;
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  classification?: string;
  ticketOwner?: string;
  productName?: string;
  vendor?: string;
  serialNumber?: string;
  dateTime1?: string;
  channel?: string;
  language?: string;
  category?: string;
  subcategory?: string;
  dueDate?: string;
}

export interface TicketResponse {
  id: string;
  contactName?: string;
  accountName?: string;
  email: string;
  phone?: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  classification?: string;
  ticketOwner?: string;
  productName?: string;
  vendor: string;
  serialNumber: string;
  dateTime1?: string;
  channel?: string;
  language?: string;
  category?: string;
  subcategory?: string;
  dueDate?: string;
  created_at: string;
  updated_at: string;
  comments?: TicketCommentResponse[];
  workOrders?: WorkOrderReference[];
  activities?: ActivityReference[];
}

export interface TicketCommentResponse {
  id: string;
  comment: string;
  author: string;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderReference {
  id: string;
  name: string;
}

export interface ActivityReference {
  id: string;
  action: string;
  performedBy: string;
  created_at: string;
}

export interface PaginatedTicketsResponse {
  data: TicketResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteTicketResponse {
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

