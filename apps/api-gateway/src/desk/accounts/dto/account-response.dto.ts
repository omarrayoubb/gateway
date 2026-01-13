export interface ContactInfo {
  id: string;
  first_name: string;
  last_name: string;
}

export interface LeadInfo {
  id: string;
  first_name: string;
  last_name: string;
}

export interface ParentAccountInfo {
  id: string;
  name: string;
  accountNumber: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string | null;
}

export interface DealInfo {
  id: string;
  name: string;
}

export interface AccountResponseDto {
  // All Account base fields
  id: string;
  name: string;
  accountNumber: string;
  phone: string | null;
  website: string | null;
  billing_street: string;
  billing_city: string;
  billing_state: string | null;
  billing_zip: string | null;
  billing_country: string | null;
  shipping_street: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string | null;
  territory: string | null;
  industry: string | null;
  accountType: string | null;
  ownership: string | null;
  parentAccountId: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Transformed fields
  Users: UserInfo[];
  Contacts: ContactInfo[];
  Leads: LeadInfo[];
  Deals: DealInfo[];
  Created_by: string;
  Modified_by: string;
  parent_accounts: ParentAccountInfo | null;
}














