import { IsString, IsOptional } from 'class-validator';

export class CompleteReconciliationDto {
  @IsString()
  @IsOptional()
  notes?: string;
}

