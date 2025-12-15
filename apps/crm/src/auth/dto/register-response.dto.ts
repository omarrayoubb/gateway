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
  roleId: string | null;
  roleName: string | null;
  profileId: string | null;
  profileName: string | null;
  dateJoined: Date;
  updatedAt: Date;
  createdAt?: Date;
}

