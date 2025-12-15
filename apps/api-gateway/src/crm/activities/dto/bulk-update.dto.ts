import { IsArray, ArrayMinSize, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateActivityDto } from './update-activity.dto';

export class BulkUpdateActivityDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one ID is required' })
  @IsUUID(undefined, { each: true, message: 'Each ID must be a valid UUID' })
  ids: string[];

  @ValidateNested()
  @Type(() => UpdateActivityDto)
  updateFields: UpdateActivityDto;
}

