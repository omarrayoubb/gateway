import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * This DTO defines the shape of the body for a login request.
 * The ValidationPipe will automatically check this.
 */
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Incorrect Email or Password' })
  password: string;
}