// libs/common/src/types/contacts.ts

// Request Types
export interface CreateContactRequest {
  // Required fields
  firstName: string;
  lastName: string;
  email: string;
  
  // Optional fields
  salutation?: string;
  phone?: string;
  mobilePhone?: string;
  ownerId?: string;
  accountId?: string;
  department?: string;
  governmentCode?: string;
  territory?: string;
  secondaryPhone?: string;
  assistantName?: string;
  currencyCode?: string;
  username?: string;
  wpNumber?: string;
  boxFolderId?: string;
  assignedProfile?: string;
  userPermissions?: string;
  mailingStreet?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingZip?: string;
  mailingCountry?: string;
}

export interface UpdateContactRequest {
  id: string;
  salutation?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  mobilePhone?: string;
  accountId?: string;
  department?: string;
  governmentCode?: string;
  territory?: string;
  secondaryPhone?: string;
  assistantName?: string;
  currencyCode?: string;
  username?: string;
  wpNumber?: string;
  boxFolderId?: string;
  assignedProfile?: string;
  userPermissions?: string;
  mailingStreet?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingZip?: string;
  mailingCountry?: string;
  ownerId?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneContactRequest {
  id: string;
}

export interface DeleteContactRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  updateFields: UpdateContactFields;
}

export interface UpdateContactFields {
  salutation?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  mobilePhone?: string;
  accountId?: string;
  department?: string;
  governmentCode?: string;
  territory?: string;
  secondaryPhone?: string;
  assistantName?: string;
  currencyCode?: string;
  username?: string;
  wpNumber?: string;
  boxFolderId?: string;
  assignedProfile?: string;
  userPermissions?: string;
  mailingStreet?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingZip?: string;
  mailingCountry?: string;
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

export interface ContactResponse {
  id: string;
  salutation?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  mobilePhone?: string | null;
  department?: string | null;
  governmentCode?: string | null;
  territory?: string | null;
  secondaryPhone?: string | null;
  assistantName?: string | null;
  currencyCode?: string | null;
  username?: string | null;
  wpNumber?: string | null;
  boxFolderId?: string | null;
  assignedProfile?: string | null;
  userPermissions?: string | null;
  mailingStreet?: string | null;
  mailingCity?: string | null;
  mailingState?: string | null;
  mailingZip?: string | null;
  mailingCountry?: string | null;
  createdAt: string;
  updatedAt: string;
  ownerData?: SimpleUserData | null;
  createdBy: string;
  modifiedBy: string;
  accountDetails?: SimpleAccount | null;
  deals: SimpleDeal[];
  activities: SimpleActivity[];
}

export interface PaginatedContactsResponse {
  data: ContactResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteContactResponse {
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

