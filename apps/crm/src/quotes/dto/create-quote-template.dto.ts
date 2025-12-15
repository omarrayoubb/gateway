import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsUUID, IsNumber } from 'class-validator';

export class CreateQuoteTemplateDto {
  @IsString()
  @IsNotEmpty()
  templateName: string;

  @IsString()
  @IsNotEmpty()
  templateFileUrl: string;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  templateType?: string; // Standard, RFQ, Proposal

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  detectedVariables?: string[];

  @IsUUID()
  @IsOptional()
  organizationId?: string;
}

