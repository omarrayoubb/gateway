import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsUUID, 
  IsDateString,
  ValidateIf 
} from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  activityType: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsDateString()
  @IsNotEmpty()
  meetingDateTime: string;

  @IsDateString()
  @IsNotEmpty()
  duration: string;

  @IsString()
  @IsOptional()
  outcome?: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  description?: string;

  // Mutually exclusive: exactly one of leadId, contactId, dealId, or accountId must be provided
  @IsUUID()
  @IsOptional()
  leadId?: string;

  @IsUUID()
  @IsOptional()
  contactId?: string;

  @IsUUID()
  @IsOptional()
  dealId?: string;

  @IsUUID()
  @IsOptional()
  accountId?: string;
}

