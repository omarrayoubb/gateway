import { IsString, IsOptional, IsDateString } from 'class-validator';

export class PostExpenseToGlDto {
  @IsDateString()
  @IsOptional()
  posting_date?: string;

  @IsString()
  @IsOptional()
  journal_entry_reference?: string;
}


