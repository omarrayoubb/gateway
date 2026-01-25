// Simple interfaces for the lists
interface SimpleUser {
    id: string;
    name: string;
    email: string;
  }
  
  interface SimpleAccount {
    id: string;
    name: string;
    accountNumber: string;
  }

  interface SimpleProfile {
    id: string;
    name: string;
  }

  interface SimpleRole {
    id: string;
    name: string;
  }

  interface SimpleLead {
    id: string;
    name: string;
  }

  interface SimpleContact {
    id: string;
    name: string;
  }

  interface SimpleProduct {
    id: string;
    name: string;
    sku: string;
  }

  interface SimpleVendor {
    id: string;
    name: string;
  }
  
  // Response for the Account Creation Form
  export class AccountOrchestratorResponse {
    owners: SimpleUser[];
  }
  
  // Response for the Contact/Lead Creation Forms (shared)
  export class ContactLeadOrchestratorResponse {
    owners: SimpleUser[];
    accounts: SimpleAccount[];
  }

  // Response for the Register Form
  export class RegisterFormOrchestratorResponse {
    profiles: SimpleProfile[];
    roles: SimpleRole[];
  }

  // Response for the Deal Form
  export class DealFormOrchestratorResponse {
    leads: SimpleLead[];
    contacts: SimpleContact[];
    accounts: SimpleAccount[];
    users: SimpleUser[];
  }

  // Response for the Activity Form
  export class ActivityFormOrchestratorResponse {
    leads: SimpleLead[];
    contacts: SimpleContact[];
  }

  // Response for the Delivery Note Form
  export class DeliveryNoteFormOrchestratorResponse {
    accounts: SimpleAccount[];
  }

  // Response for the RFQ Creation Form
  export class RfqFormOrchestratorResponse {
    products: SimpleProduct[];
    vendors: SimpleVendor[];
    accounts: SimpleAccount[];
    contacts: SimpleContact[];
    leads: SimpleLead[];
  }

  // Response for the Sales Order Form
  export class SalesOrderFormOrchestratorResponse {
    products: SimpleProduct[];
    vendors: SimpleVendor[];
  }