import { IsArray, ArrayMinSize, IsUUID } from 'class-validator';

export class BulkDeleteDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one ID is required' })
  @IsUUID(undefined, { each: true, message: 'Each ID must be a valid UUID' })
  ids: string[];
}
