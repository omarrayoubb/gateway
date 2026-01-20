import { IsUUID, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreatePaymentAllocationDto {
  @IsUUID()
  @IsNotEmpty()
  invoice_id: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;
}

