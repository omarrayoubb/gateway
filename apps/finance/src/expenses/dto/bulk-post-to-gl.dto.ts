import { IsArray, IsDateString, IsUUID } from 'class-validator';

export class BulkPostExpensesToGlDto {
  @IsArray()
  @IsUUID('4', { each: true })
  expense_ids: string[];

  @IsDateString()
  posting_date: string;
}


