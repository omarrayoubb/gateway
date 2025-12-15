/**
 * Response DTO for login endpoint
 */
export class LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string | null;
    name: string;
    workId: string;
    workLocation: string;
  };
}

