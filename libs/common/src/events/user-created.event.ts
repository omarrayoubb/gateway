/**
 * Event payload for user creation (and updates - same shape).
 * Published by Accounts when a user is registered or profile updated.
 * Consumed by People (and CRM for created) to create/update local copy.
 * Includes all user fields except password; for each ID (departmentId, managerId)
 * the corresponding name (departmentName, managerName) is included.
 */
export class UserCreatedEvent {
  id: string;
  workId: string;
  email: string | null;
  name: string;
  role: string;
  /** Department display name (alongside departmentId) */
  department: string;
  departmentId: string | null;
  /** Department display name - same as department, explicit for clarity */
  departmentName: string;
  workLocation: string;
  timezone: string | null;
  birthday: string | null; // ISO date string
  dateJoined: string; // ISO datetime
  updatedAt: string; // ISO datetime
  status: string | null;
  position: string | null;
  hireDate: string | null; // ISO date string
  managerId: string | null;
  /** Manager display name (alongside managerId) */
  managerName: string | null;
  hierarchyLevel: number | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;
  baseSalary: string | null;
}
