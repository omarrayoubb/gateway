// libs/common/src/types/orchestrator.ts

// Request Types
export interface Empty { }

export interface ConvertLeadToContactRequest {
  leadId: string;
}

// Response Types
export interface SimpleUser {
  id: string;
  name: string;
  email: string;
}

export interface SimpleAccount {
  id: string;
  name: string;
  accountNumber: string;
}

export interface SimpleProfile {
  id: string;
  name: string;
}

export interface SimpleRole {
  id: string;
  name: string;
}

export interface SimpleLead {
  id: string;
  name: string;
}

export interface SimpleContact {
  id: string;
  name: string;
}

export interface SimpleProduct {
  id: string;
  name: string;
  sku: string;
}

export interface SimpleVendor {
  id: string;
  name: string;
}

export interface AccountFormOptionsResponse {
  owners: SimpleUser[];
}

export interface ContactLeadFormOptionsResponse {
  owners: SimpleUser[];
  accounts: SimpleAccount[];
}

export interface RegisterFormOptionsResponse {
  profiles: SimpleProfile[];
  roles: SimpleRole[];
}

export interface DealFormOptionsResponse {
  leads: SimpleLead[];
  contacts: SimpleContact[];
  accounts: SimpleAccount[];
  users: SimpleUser[];
}

export interface ActivityFormOptionsResponse {
  leads: SimpleLead[];
  contacts: SimpleContact[];
}

export interface DeliveryNoteFormOptionsResponse {
  accounts: SimpleAccount[];
}

export interface RfqFormOptionsResponse {
  products: SimpleProduct[];
  vendors: SimpleVendor[];
  accounts: SimpleAccount[];
  contacts: SimpleContact[];
  leads: SimpleLead[];
}

export interface SalesOrderFormOptionsResponse {
  products: SimpleProduct[];
  vendors: SimpleVendor[];
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
  ownerData?: SimpleUser | null;
  createdBy?: string | null;
  modifiedBy?: string | null;
  accountDetails?: SimpleAccount | null;
  deals?: SimpleDeal[];
  activities?: SimpleActivity[];
  createdAt: string;
  updatedAt: string;
}

