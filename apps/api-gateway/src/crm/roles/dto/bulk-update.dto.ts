import { IsArray, ArrayMinSize, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateRoleDto } from './update-role.dto';

export class BulkUpdateRoleDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  ids: string[];

  @ValidateNested()
  @Type(() => UpdateRoleDto)
  updateFields: UpdateRoleDto;
}

