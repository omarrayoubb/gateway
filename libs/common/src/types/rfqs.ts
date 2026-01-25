// Request Types
export interface CreateRFQRequest {
  rfqName: string;
  rfqNumber?: string;
  accountId: string;
  contactId?: string;
  leadId?: string;
  vendorId?: string;
  currency: string;
  status?: string;
  paymentTerms?: string;
  additionalNotes?: string;
  rfqProducts?: RFQProductMessage[];
}

export interface UpdateRFQRequest {
  id: string;
  rfqName?: string;
  rfqNumber?: string;
  accountId?: string;
  contactId?: string;
  leadId?: string;
  vendorId?: string;
  currency?: string;
  status?: string;
  paymentTerms?: string;
  additionalNotes?: string;
  rfqProducts?: RFQProductMessage[];
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneRFQRequest {
  id: string;
}

export interface DeleteRFQRequest {
  id: string;
}

export interface RFQProductMessage {
  productId?: string;
  quantity: number;
  discount?: string;
}

// Response Types
export interface RFQProductResponse {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  discount?: string;
}

export interface RFQResponse {
  id: string;
  rfqName: string;
  rfqNumber: string;
  accountId: string;
  accountName: string;
  contactId?: string;
  contactName?: string;
  leadId?: string;
  leadName?: string;
  vendorId?: string;
  vendorName?: string;
  currency: string;
  status: string;
  paymentTerms?: string;
  additionalNotes?: string;
  rfqProducts?: RFQProductResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedRfqsResponse {
  data: RFQResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteRFQResponse {
  success: boolean;
  message: string;
}

