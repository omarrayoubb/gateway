/**
 * Request DTO for getting a user profile. Mirrors GetProfileRequest (auth types).
 * Used with GET /accounts/profile (userId comes from validated token).
 */
export class GetProfileRequestDto {
  userId: string;
}

/** @deprecated Use GetProfileRequestDto */
export type GetProfileDto = GetProfileRequestDto;

/**
 * Response shape for user profile. Mirrors User entity (apps/accounts users.entity.ts) / UserProfile (auth types).
 * Returned by GetProfile and UpdateProfile.
 */
export class GetProfileResponseDto {
  id: string;
  workId: string;
  name: string;
  email: string;
  workLocation: string;
  role: string;
  timezone: string;
  departmentId: string | null;
  department: string; // department name from join
  birthday: string;
  dateJoined: string;
  status?: string;
  position?: string;
  hireDate?: string;
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
