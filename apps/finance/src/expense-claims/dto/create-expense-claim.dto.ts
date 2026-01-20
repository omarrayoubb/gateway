import { IsString, IsOptional, IsDateString, IsArray, IsUUID } from 'class-validator';

export class CreateExpenseClaimDto {
  @IsOptional()
  @IsString()
  organization_id?: string;

  @IsOptional()
  @IsString()
  claim_number?: string;

  @IsOptional()
  @IsString()
  employee_id?: string;

  @IsDateString()
  claim_date: string;

  @IsArray()
  @IsUUID('4', { each: true })
  expense_ids: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

