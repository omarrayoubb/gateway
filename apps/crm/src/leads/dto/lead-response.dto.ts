/**
 * Defines the shape of the custom response for a Lead.
 * This is not a validation DTO, but a data structure.
 */

interface SimpleAccount {
    id: string;
    name: string;
    accountNumber: string;
  }
  
  // This new interface is defined as you requested
  interface SimpleUserData {
    id: string;
    firstName: string;
    lastName: string;
  }
  
  export class LeadResponseDto {
    // Base Lead fields
    id: string;
    salutation: string | null;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    shipping_street: string;
    billing_city: string;
    product_name: string | null;
    currency_code: string | null;
    employee_count: number | null;
    hq_code: string | null;
    billing_amount: number | null;
    exchange_rate: number | null;
    shipping_street_2: string | null;
    shipping_city: string | null;
    shipping_state: string | null;
    shipping_country: string | null;
    shipping_zip_code: string | null;
    billing_street: string | null;
    billing_street_2: string | null;
    billing_state: string | null;
    billing_country: string | null;
    billing_zip_code: string | null;
    createdAt: Date;
    updatedAt: Date;
    
  
  
    // Transformed fields (with names)
    OwnerData: SimpleUserData | null; // Changed from Owner_name
    Created_by: string;
    Modified_by: string;
    Account_details: SimpleAccount | null;
    Deals: Array<{ id: string; name: string }>;
    Activities: Array<{ id: string; activityType: string; subject: string }>;
  }