import { PartialType } from '@nestjs/mapped-types';
import { CreateTaxConfigurationDto } from './create-tax-configuration.dto';

export class UpdateTaxConfigurationDto extends PartialType(CreateTaxConfigurationDto) {}

