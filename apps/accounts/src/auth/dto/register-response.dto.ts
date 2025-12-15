/**
 * Response DTO for register endpoint
 * Returns user data without password, including profile and role information
 */
export class RegisterResponseDto {
  id: string;
  workId: string;
  email: string | null;
  name: string;
  timezone: string | null;
  workLocation: string;
  department: string | null;
  deptManager: string | null;
  birthday: Date | null;
  dateJoined: Date;
  updatedAt: Date;
  roleId?: string | null;
  profileId?: string | null;
  createdAt?: Date;
}

