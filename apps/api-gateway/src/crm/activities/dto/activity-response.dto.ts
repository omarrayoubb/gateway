export interface LeadInfo {
  id: string;
  first_name: string;
  last_name: string;
}

export interface ContactInfo {
  id: string;
  first_name: string;
  last_name: string;
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

export interface ActivityResponseDto {
  id: string;
  activityType: string;
  subject: string;
  meetingDateTime: Date;
  duration: Date;
  outcome: string | null;
  status: string;
  description: string | null;
  createdBy: string;
  createdAt: Date;
  
  // Related entity info
  lead: LeadInfo | null;
  contact: ContactInfo | null;
  deal: DealInfo | null;
  account: AccountInfo | null;
  
  // Original IDs for reference
  leadId: string | null;
  contactId: string | null;
  dealId: string | null;
  accountId: string | null;
}

