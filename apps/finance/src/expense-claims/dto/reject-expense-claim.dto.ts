import { IsString, IsOptional } from 'class-validator';

export class RejectExpenseClaimDto {
  @IsOptional()
  @IsString()
  rejected_by?: string;

  @IsString()
  rejection_reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

