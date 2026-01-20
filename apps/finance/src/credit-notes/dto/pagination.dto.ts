import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { CreditNoteStatus } from '../entities/credit-note.entity';

export class CreditNotePaginationDto {
  @IsString()
  @IsOptional()
  sort?: string;

  @IsEnum(CreditNoteStatus)
  @IsOptional()
  status?: CreditNoteStatus;

  @IsUUID()
  @IsOptional()
  customer_id?: string;
}

