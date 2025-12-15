import { IsArray, ArrayMinSize, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateTaskDto } from './update-task.dto';

export class BulkUpdateTaskDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  ids: string[];

  @ValidateNested()
  @Type(() => UpdateTaskDto)
  updateFields: UpdateTaskDto;
}

