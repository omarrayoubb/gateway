/**
 * DTO for user registration. Mirrors User entity (apps/accounts users.entity.ts).
 * Required fields align with entity; optional fields match extended profile.
 */
export class RegisterDto {
  // Required (entity: work_id, name, email, password, work_location, role)
  workId: string;
  name: string;
  email: string;
  password: string;
  workLocation: string;
  role: string;

  // Optional – base profile
  timezone?: string;
  departmentId?: string | null;
  /** Department name (resolved to departmentId if departmentId not provided) */
  department?: string;
  birthday?: string; // ISO date string

  // Optional – extended profile (entity: status, position, hire_date, manager_id, etc.)
  status?: string;
  position?: string;
  hireDate?: string; // ISO date string
  managerId?: string | null;
  hierarchyLevel?: number | null;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  baseSalary?: string | null;
}
