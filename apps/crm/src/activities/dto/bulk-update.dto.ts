import { IsArray, IsUUID, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateActivityDto } from './update-activity.dto';

export class BulkUpdateActivityDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  ids: string[];

  @ValidateNested()
  @Type(() => UpdateActivityDto)
  updateFields: UpdateActivityDto;
}

