import { IsString, MinLength } from 'class-validator';

export class ActivateUserDto {
  @IsString()
  activationToken: string;

  @IsString()
  @MinLength(8)
  password: string;
}
