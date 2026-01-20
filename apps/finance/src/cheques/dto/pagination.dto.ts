import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ChequeType, ChequeStatus } from '../entities/cheque.entity';

export class ChequePaginationDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsEnum(ChequeType)
  type?: ChequeType;

  @IsOptional()
  @IsEnum(ChequeStatus)
  status?: ChequeStatus;
}

