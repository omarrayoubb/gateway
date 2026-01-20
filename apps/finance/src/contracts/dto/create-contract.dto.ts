import {
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUrl,
  Min,
  Length,
} from 'class-validator';
import { ContractType, PartyType, BillingFrequency } from '../entities/contract.entity';

export class CreateContractDto {
  @IsUUID()
  @IsNotEmpty()
  organization_id: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  contract_number: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  contract_name: string;

  @IsEnum(ContractType)
  @IsNotEmpty()
  contract_type: ContractType;

  @IsEnum(PartyType)
  @IsOptional()
  party_type?: PartyType;

  @IsUUID()
  @IsOptional()
  party_id?: string;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  total_value?: number;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;

  @IsString()
  @IsOptional()
  payment_terms?: string;

  @IsEnum(BillingFrequency)
  @IsOptional()
  billing_frequency?: BillingFrequency;

  @IsBoolean()
  @IsOptional()
  auto_renew?: boolean;

  @IsDateString()
  @IsOptional()
  renewal_date?: string;

  @IsUUID()
  @IsOptional()
  project_id?: string;

  @IsUUID()
  @IsOptional()
  cost_center_id?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUrl()
  @IsOptional()
  document_url?: string;
}

