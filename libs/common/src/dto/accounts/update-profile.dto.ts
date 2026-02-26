/**
 * DTO for updating user profile. Mirrors User entity (apps/accounts users.entity.ts).
 * All fields optional; only provided fields are updated.
 */
export class UpdateProfileDto {
  workId?: string;
  name?: string;
  email?: string;
  workLocation?: string;
  role?: string;
  timezone?: string;
  departmentId?: string | null;
  birthday?: string; // ISO date string
  password?: string; // optional password change
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
