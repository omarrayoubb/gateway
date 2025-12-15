import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, IsDateString } from 'class-validator';
import { CreateKnowledgeBaseDto } from './create-knowledge-base.dto';

export class UpdateKnowledgeBaseDto extends PartialType(CreateKnowledgeBaseDto) {
  @IsNumber()
  @IsOptional()
  view_count?: number;

  @IsNumber()
  @IsOptional()
  helpful_count?: number;

  @IsDateString()
  @IsOptional()
  last_updated?: string;
}

