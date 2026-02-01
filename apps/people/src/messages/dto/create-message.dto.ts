import { IsUUID, IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  senderId: string;

  @IsUUID()
  recipientId: string;

  @IsString()
  subject: string;

  @IsString()
  content: string;

  @IsBoolean()
  @IsOptional()
  read?: boolean;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}
