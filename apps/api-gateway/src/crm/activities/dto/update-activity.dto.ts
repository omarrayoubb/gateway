import { 
  IsString, 
  IsOptional, 
  IsUUID, 
  IsDateString,
  ValidateIf 
} from 'class-validator';

export class UpdateActivityDto {
  @IsString()
  @IsOptional()
  activityType?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsDateString()
  @IsOptional()
  meetingDateTime?: string;

  @IsDateString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  outcome?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  description?: string;

  // If updating relationship, maintain mutual exclusivity
  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => o.leadId || o.contactId || o.dealId || o.accountId)
  leadId?: string | null;

  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => o.leadId || o.contactId || o.dealId || o.accountId)
  contactId?: string | null;

  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => o.leadId || o.contactId || o.dealId || o.accountId)
  dealId?: string | null;

  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => o.leadId || o.contactId || o.dealId || o.accountId)
  accountId?: string | null;
}

