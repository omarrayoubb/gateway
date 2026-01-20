/**
 * Defines the shape of the custom response for a Contact.
 * This is not a validation DTO, but a data structure.
 */

interface SimpleAccount {
  id: string;
  name: string;
  accountNumber: string;
}

// This interface matches the one from your LeadResponseDto
interface SimpleUserData {
  id: string;
  firstName: string;
  lastName: string;
}

export class ContactResponseDto {
  // Base Contact fields
  id: string;
  salutation: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  mobile_phone: string | null;
  department: string | null;
  government_code: string | null;
  territory: string | null;
  secondary_phone: string | null;
  assistant_name: string | null;
  currency_code: string | null;
  username: string | null;
  wp_number: string | null;
  box_folder_id: string | null;
  assigned_profile: string | null;
  user_permissions: string | null;
  mailing_street: string | null;
  mailing_city: string | null;
  mailing_state: string | null;
  mailing_zip: string | null;
  mailing_country: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Transformed fields (with names)
  OwnerData: SimpleUserData | null;
  Created_by: string;
  Modified_by: string;
  Account_details: SimpleAccount | null;
  Deals: Array<{ id: string; name: string }>;
  Activities: Array<{ id: string; activityType: string; subject: string }>;
}


















