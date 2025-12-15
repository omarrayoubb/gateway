import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreateKnowledgeBaseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  @IsIn([
    'Technical Issue',
    'Billing',
    'Installation',
    'Training',
    'General Inquiry',
    'Other',
  ])
  category?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  @IsIn(['Draft', 'Published'])
  status?: string;
}

