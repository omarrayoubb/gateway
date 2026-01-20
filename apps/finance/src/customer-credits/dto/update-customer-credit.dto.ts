import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerCreditDto } from './create-customer-credit.dto';

export class UpdateCustomerCreditDto extends PartialType(CreateCustomerCreditDto) {}

