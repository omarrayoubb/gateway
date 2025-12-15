import { IsArray, ArrayMinSize, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateLeadDto } from 'apps/crm/src/leads/dto/update-lead.dto copy';

export class BulkUpdateLeadDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one ID is required' })
  @IsUUID(undefined, { each: true, message: 'Each ID must be a valid UUID' })
  ids: string[];

  @ValidateNested()
  @Type(() => UpdateLeadDto)
  updateFields: UpdateLeadDto;
}

