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

