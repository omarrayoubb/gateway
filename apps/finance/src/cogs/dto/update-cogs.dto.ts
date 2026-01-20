import { PartialType } from '@nestjs/mapped-types';
import { CreateCogsDto } from './create-cogs.dto';

export class UpdateCogsDto extends PartialType(CreateCogsDto) {}

