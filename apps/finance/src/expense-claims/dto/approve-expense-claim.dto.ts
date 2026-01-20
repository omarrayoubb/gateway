import { IsString, IsOptional } from 'class-validator';

export class ApproveExpenseClaimDto {
  @IsOptional()
  @IsString()
  approved_by?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

