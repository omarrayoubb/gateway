/**
 * Response DTO for login endpoint
 */
export class LoginResponseDto {
  accessToken: string;
  user: {
    sub: string;
    email: string | null;
    roleId: string | null;
    roleName: string | null;
    profileId: string | null;
    profileName: string | null;
  };
}

