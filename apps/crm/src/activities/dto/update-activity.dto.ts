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
  leadId?: string | null;

  @IsUUID()
  @IsOptional()
  contactId?: string | null;

  @IsUUID()
  @IsOptional()
  dealId?: string | null;

  @IsUUID()
  @IsOptional()
  accountId?: string | null;
}

