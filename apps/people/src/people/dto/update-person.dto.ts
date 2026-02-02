import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-person.dto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}

