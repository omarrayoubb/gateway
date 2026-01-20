import { IsOptional, IsNumber, IsString, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { EntryType, JournalEntryStatus } from '../entities/journal-entry.entity';

export class JournalEntryPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsEnum(EntryType)
  entry_type?: EntryType;

  @IsOptional()
  @IsEnum(JournalEntryStatus)
  status?: JournalEntryStatus;
}

