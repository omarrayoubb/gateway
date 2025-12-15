import { IsArray, ArrayMinSize, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateKnowledgeBaseDto } from './update-knowledge-base.dto';

export class BulkUpdateKnowledgeBaseDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one ID is required' })
  @IsUUID(undefined, { each: true, message: 'Each ID must be a valid UUID' })
  ids: string[];

  @ValidateNested()
  @Type(() => UpdateKnowledgeBaseDto)
  updateFields: UpdateKnowledgeBaseDto;
}

