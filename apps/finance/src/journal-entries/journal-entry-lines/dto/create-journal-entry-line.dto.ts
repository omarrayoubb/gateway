import { IsString, IsUUID, IsOptional, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class CreateJournalEntryLineDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsUUID()
  @IsOptional()
  journal_entry_id?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  line_number?: number;

  @IsUUID()
  account_id: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  debit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  credit?: number;
}

