import { IsString, IsOptional, IsBoolean, IsArray, IsUUID } from 'class-validator';

export class UpdateQuoteTemplateDto {
  @IsString()
  @IsOptional()
  templateName?: string;

  @IsString()
  @IsOptional()
  templateFileUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  templateType?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  detectedVariables?: string[];

  @IsUUID()
  @IsOptional()
  organizationId?: string;
}

