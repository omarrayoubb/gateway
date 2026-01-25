// libs/common/src/types/leads.ts

// Request Types
export interface CreateLeadRequest {
  // Required fields
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  
  // Optional fields
  shippingStreet?: string;
  billingCity?: string;
  ownerId?: string;
  salutation?: string;
  accountId?: string;
  productName?: string;
  currencyCode?: string;
  employeeCount?: number;
  hqCode?: string;
  billingAmount?: number;
  exchangeRate?: number;
  shippingStreet2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCountry?: string;
  shippingZipCode?: string;
  billingStreet?: string;
  billingStreet2?: string;
  billingState?: string;
  billingCountry?: string;
  billingZipCode?: string;
}

export interface UpdateLeadRequest {
  id: string;
  salutation?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string; // Note: Email is forbidden in UpdateLeadDto but included in proto for consistency
  shippingStreet?: string;
  billingCity?: string;
  accountId?: string;
  productName?: string;
  currencyCode?: string;
  employeeCount?: number;
  hqCode?: string;
  billingAmount?: number;
  exchangeRate?: number;
  shippingStreet2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCountry?: string;
  shippingZipCode?: string;
  billingStreet?: string;
  billingStreet2?: string;
  billingState?: string;
  billingCountry?: string;
  billingZipCode?: string;
  ownerId?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneLeadRequest {
  id: string;
}

export interface DeleteLeadRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  updateFields: UpdateLeadFields;
}

export interface UpdateLeadFields {
  salutation?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  shippingStreet?: string;
  billingCity?: string;
  accountId?: string;
  productName?: string;
  currencyCode?: string;
  employeeCount?: number;
  hqCode?: string;
  billingAmount?: number;
  exchangeRate?: number;
  shippingStreet2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCountry?: string;
  shippingZipCode?: string;
  billingStreet?: string;
  billingStreet2?: string;
  billingState?: string;
  billingCountry?: string;
  billingZipCode?: string;
  ownerId?: string;
}

// Response Types
export interface SimpleUserData {
  id: string;
  firstName: string;
  lastName: string;
}

export interface SimpleAccount {
  id: string;
  name: string;
  accountNumber: string;
}

export interface SimpleDeal {
  id: string;
  name: string;
}

export interface SimpleActivity {
  id: string;
  activityType: string;
  subject: string;
}

export interface LeadResponse {
  id: string;
  salutation?: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  shippingStreet: string;
  billingCity: string;
  productName?: string | null;
  currencyCode?: string | null;
  employeeCount?: number | null;
  hqCode?: string | null;
  billingAmount?: number | null;
  exchangeRate?: number | null;
  shippingStreet2?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingCountry?: string | null;
  shippingZipCode?: string | null;
  billingStreet?: string | null;
  billingStreet2?: string | null;
  billingState?: string | null;
  billingCountry?: string | null;
  billingZipCode?: string | null;
  createdAt: string;
  updatedAt: string;
  ownerData?: SimpleUserData | null;
  createdBy: string;
  modifiedBy: string;
  accountDetails?: SimpleAccount | null;
  deals: SimpleDeal[];
  activities: SimpleActivity[];
}

export interface PaginatedLeadsResponse {
  data: LeadResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteLeadResponse {
  success: boolean;
}

export interface FailedId {
  id: string;
  error: string;
}

export interface BulkDeleteResponse {
  deletedCount: number;
  failedIds?: FailedId[];
}

export interface FailedItem {
  id: string;
  error: string;
}

export interface BulkUpdateResponse {
  updatedCount: number;
  failedItems?: FailedItem[];
}

