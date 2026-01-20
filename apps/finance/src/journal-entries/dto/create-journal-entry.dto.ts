import { IsString, IsEnum, IsUUID, IsOptional, IsDateString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { EntryType, JournalEntryStatus } from '../entities/journal-entry.entity';
import { CreateJournalEntryLineDto } from '../journal-entry-lines/dto/create-journal-entry-line.dto';

export class CreateJournalEntryDto {
  @IsUUID()
  @IsOptional()
  organization_id?: string;

  @IsString()
  @IsNotEmpty()
  entry_number: string;

  @IsDateString()
  @IsNotEmpty()
  entry_date: string;

  @IsEnum(EntryType)
  @IsNotEmpty()
  entry_type: EntryType;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(JournalEntryStatus)
  @IsOptional()
  status?: JournalEntryStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalEntryLineDto)
  @IsOptional()
  lines?: CreateJournalEntryLineDto[];
}

