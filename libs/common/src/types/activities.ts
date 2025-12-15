// libs/common/src/types/activities.ts

// Request Types
export interface CreateActivityRequest {
  // Required fields
  activityType: string;
  subject: string;
  meetingDateTime: string;
  duration: string;
  status: string;
  
  // Mutually exclusive: exactly one of leadId or contactId must be provided
  leadId?: string;
  contactId?: string;
  
  // Optional fields
  outcome?: string;
  description?: string;
  dealId?: string;
  accountId?: string;
}

export interface UpdateActivityRequest {
  id: string;
  activityType?: string;
  subject?: string;
  meetingDateTime?: string;
  duration?: string;
  status?: string;
  outcome?: string;
  description?: string;
  leadId?: string | null;
  contactId?: string | null;
  dealId?: string | null;
  accountId?: string | null;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneActivityRequest {
  id: string;
}

export interface DeleteActivityRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  updateFields: UpdateActivityFields;
}

export interface UpdateActivityFields {
  activityType?: string;
  subject?: string;
  meetingDateTime?: string;
  duration?: string;
  status?: string;
  outcome?: string;
  description?: string;
  leadId?: string | null;
  contactId?: string | null;
  dealId?: string | null;
  accountId?: string | null;
}

// Response Types
export interface LeadInfo {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ContactInfo {
  id: string;
  firstName: string;
  lastName: string;
}

export interface DealInfo {
  id: string;
  name: string;
}

export interface AccountInfo {
  id: string;
  name: string;
  accountNumber: string;
}

export interface ActivityResponse {
  id: string;
  activityType: string;
  subject: string;
  meetingDateTime: string;
  duration: string;
  outcome?: string | null;
  status: string;
  description?: string | null;
  createdBy: string;
  createdAt: string;
  leadId?: string | null;
  contactId?: string | null;
  dealId?: string | null;
  accountId?: string | null;
  lead?: LeadInfo | null;
  contact?: ContactInfo | null;
  deal?: DealInfo | null;
  account?: AccountInfo | null;
}

export interface PaginatedActivitiesResponse {
  data: ActivityResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteActivityResponse {
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

