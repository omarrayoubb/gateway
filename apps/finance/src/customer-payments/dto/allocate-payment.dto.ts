import { IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePaymentAllocationDto } from './create-payment-allocation.dto';

export class AllocatePaymentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentAllocationDto)
  @IsNotEmpty()
  allocations: CreatePaymentAllocationDto[];
}

