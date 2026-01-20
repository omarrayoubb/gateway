import { IsString, IsEnum, IsObject, IsOptional, IsUUID } from 'class-validator';

export enum ImportFileFormat {
  CSV = 'csv',
  OFX = 'ofx',
  QIF = 'qif',
  EXCEL = 'excel',
}

export class ImportMappingDto {
  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  amount?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  reference?: string;
}

export class ImportBankTransactionsDto {
  @IsUUID()
  bank_account_id: string;

  @IsString()
  file_url: string;

  @IsEnum(ImportFileFormat)
  file_format: ImportFileFormat;

  @IsObject()
  @IsOptional()
  mapping?: ImportMappingDto;
}

