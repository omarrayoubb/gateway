import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryValuationDto } from './create-inventory-valuation.dto';

export class UpdateInventoryValuationDto extends PartialType(CreateInventoryValuationDto) {}

