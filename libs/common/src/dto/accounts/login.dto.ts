/**
 * DTO for user login. Mirrors LoginRequest (auth types) / User entity identity (email + password).
 */
export class LoginDto {
  email: string;
  password: string;
}
