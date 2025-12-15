import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class BulkDeleteDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  ids: string[];
}

