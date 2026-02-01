import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class UpdateMessageDto {
  @IsBoolean()
  @IsOptional()
  read?: boolean;

  @IsDateString()
  @IsOptional()
  readAt?: string;
}
