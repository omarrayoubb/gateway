import { IsString, IsArray, IsNumber, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MatchItemDto {
  @IsUUID()
  transaction_id: string;

  @IsNumber()
  statement_item_index: number;
}

export class MatchTransactionsDto {
  @IsUUID()
  reconciliation_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchItemDto)
  matches: MatchItemDto[];
}

