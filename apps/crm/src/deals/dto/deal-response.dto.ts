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

export interface DealResponseDto {
  id: string;
  name: string;
  amount: number | null;
  closingDate: Date | null;
  currency: string | null;
  type: string | null;
  stage: string | null;
  probability: number | null;
  leadSource: string | null;
  description: string | null;
  boxFolderId: string | null;
  campaignSource: string | null;
  quote: string | null;
  ownerId: string;
  accountId: string;
  leadId: string | null;
  contactId: string | null;
  createdBy: string;
  modifiedBy: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Related entities (id and name only)
  Account: AccountInfo;
  Lead: LeadInfo | null;
  Contact: ContactInfo | null;
}

