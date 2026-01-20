import { PartialType } from '@nestjs/mapped-types';
import { CreateStockImpactDto } from './create-stock-impact.dto';

export class UpdateStockImpactDto extends PartialType(CreateStockImpactDto) {}

