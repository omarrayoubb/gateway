import { PartialType } from '@nestjs/mapped-types';
import { CreateDepreciationDto } from './create-depreciation.dto';

export class UpdateDepreciationDto extends PartialType(CreateDepreciationDto) {}

