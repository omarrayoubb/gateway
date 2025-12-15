// libs/common/src/types/deals.ts

// Request Types
export interface CreateDealRequest {
  // Required fields
  name: string;
  accountId: string;
  ownerId: string;
  
  // Optional fields - either leadId OR contactId (mutually exclusive)
  leadId?: string | null;
  contactId?: string | null;
  amount?: number;
  closingDate?: string; // ISO date string
  currency?: string;
  type?: string;
  stage?: string;
  probability?: number;
  leadSource?: string;
  description?: string;
  boxFolderId?: string;
  campaignSource?: string;
  quote?: string;
}

export interface UpdateDealRequest {
  id: string;
  name?: string;
  accountId?: string;
  ownerId?: string;
  leadId?: string | null;
  contactId?: string | null;
  amount?: number;
  closingDate?: string; // ISO date string
  currency?: string;
  type?: string;
  stage?: string;
  probability?: number;
  leadSource?: string;
  description?: string;
  boxFolderId?: string;
  campaignSource?: string;
  quote?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneDealRequest {
  id: string;
}

export interface DeleteDealRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  updateFields: UpdateDealFields;
}

export interface UpdateDealFields {
  name?: string;
  accountId?: string;
  ownerId?: string;
  leadId?: string | null;
  contactId?: string | null;
  amount?: number;
  closingDate?: string;
  currency?: string;
  type?: string;
  stage?: string;
  probability?: number;
  leadSource?: string;
  description?: string;
  boxFolderId?: string;
  campaignSource?: string;
  quote?: string;
}

// Response Types
export interface AccountInfo {
  id: string;
  name: string;
}

export interface LeadInfo {
  id: string;
  name: string;
}

export interface ContactInfo {
  id: string;
  name: string;
}

export interface SimpleUserData {
  id: string;
  firstName: string;
  lastName: string;
}

export interface DealResponse {
  id: string;
  name: string;
  amount?: number | null;
  closingDate?: string | null;
  currency?: string | null;
  type?: string | null;
  stage?: string | null;
  probability?: number | null;
  leadSource?: string | null;
  description?: string | null;
  boxFolderId?: string | null;
  campaignSource?: string | null;
  quote?: string | null;
  ownerId: string;
  accountId: string;
  leadId?: string | null;
  contactId?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  modifiedBy: string;
  accountInfo: AccountInfo;
  leadInfo?: LeadInfo | null;
  contactInfo?: ContactInfo | null;
  ownerData?: SimpleUserData | null;
}

export interface PaginatedDealsResponse {
  data: DealResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteDealResponse {
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

