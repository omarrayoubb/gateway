// libs/common/src/types/accounts.ts

// Request Types
export interface CreateAccountRequest {
  // Required fields
  name: string;
  phone: string;
  userIds: string[]; // Required - at least one user
  
  // Optional fields
  accountNumber?: string;
  website?: string;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  shippingCountry?: string;
  territory?: string;
  industry?: string;
  accountType?: string;
  ownership?: string;
  parentAccountId?: string;
}

export interface UpdateAccountRequest {
  id: string;
  name?: string;
  phone?: string;
  website?: string;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  shippingCountry?: string;
  territory?: string;
  industry?: string;
  accountType?: string;
  ownership?: string;
  userIds?: string[];
  parentAccountId?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneAccountRequest {
  id: string;
}

export interface DeleteAccountRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  updateFields: UpdateAccountFields;
}

export interface UpdateAccountFields {
  name?: string;
  phone?: string;
  website?: string;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  shippingCountry?: string;
  territory?: string;
  industry?: string;
  accountType?: string;
  ownership?: string;
  userIds?: string[];
  parentAccountId?: string;
}

// Response Types
export interface UserInfo {
  id: string;
  name: string;
  email?: string | null;
}

export interface ContactInfo {
  id: string;
  firstName: string;
  lastName: string;
}

export interface LeadInfo {
  id: string;
  firstName: string;
  lastName: string;
}

export interface DealInfo {
  id: string;
  name: string;
}

export interface ParentAccountInfo {
  id: string;
  name: string;
  accountNumber: string;
}

export interface AccountResponse {
  id: string;
  name: string;
  accountNumber: string;
  phone?: string | null;
  website?: string | null;
  billingStreet: string;
  billingCity: string;
  billingState?: string | null;
  billingZip?: string | null;
  billingCountry?: string | null;
  shippingStreet?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingZip?: string | null;
  shippingCountry?: string | null;
  territory?: string | null;
  industry?: string | null;
  accountType?: string | null;
  ownership?: string | null;
  parentAccountId?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  modifiedBy: string;
  users: UserInfo[];
  contacts: ContactInfo[];
  leads: LeadInfo[];
  deals: DealInfo[];
  parentAccount?: ParentAccountInfo | null;
}

export interface PaginatedAccountsResponse {
  data: AccountResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteAccountResponse {
  success: boolean;
}

export interface BulkDeleteResponse {
  deletedCount: number;
  failedIds: FailedId[];
}

export interface FailedId {
  id: string;
  error: string;
}

export interface BulkUpdateResponse {
  updatedCount: number;
  failedItems: FailedItem[];
}

export interface FailedItem {
  id: string;
  error: string;
}

