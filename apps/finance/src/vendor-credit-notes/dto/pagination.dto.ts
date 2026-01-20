import { IsOptional, IsString, IsEnum } from 'class-validator';
import { VendorCreditNoteStatus } from '../entities/vendor-credit-note.entity';

export class VendorCreditNotePaginationDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsEnum(VendorCreditNoteStatus)
  status?: VendorCreditNoteStatus;

  @IsOptional()
  @IsString()
  vendor_id?: string;
}

