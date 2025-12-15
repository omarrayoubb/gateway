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

  // Mutually exclusive: exactly one of leadId or contactId must be provided
  @IsUUID()
  @ValidateIf((o) => !o.contactId && !o.dealId && !o.accountId)
  @IsOptional()
  leadId?: string;

  @IsUUID()
  @ValidateIf((o) => !o.leadId && !o.dealId && !o.accountId)
  @IsOptional()
  contactId?: string;

  @IsUUID()
  @ValidateIf((o) => !o.leadId && !o.contactId && !o.accountId)
  @IsOptional()
  dealId?: string;

  @IsUUID()
  @ValidateIf((o) => !o.leadId && !o.contactId && !o.dealId)
  @IsOptional()
  accountId?: string;
}

