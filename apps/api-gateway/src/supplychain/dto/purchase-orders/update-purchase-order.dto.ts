import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseOrderDto } from './create-purchase-order.dto';
import { IsOptional, IsEnum, IsUUID, IsBoolean, IsDateString } from 'class-validator';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class UpdatePurchaseOrderDto extends PartialType(CreatePurchaseOrderDto) {
  @IsOptional()
  @IsEnum(ApprovalStatus)
  approval_status?: ApprovalStatus;

  @IsOptional()
  @IsBoolean()
  requires_approval?: boolean;

  @IsOptional()
  @IsUUID()
  submitted_for_approval_by?: string;

  @IsOptional()
  @IsDateString()
  submitted_for_approval_at?: string;

  @IsOptional()
  @IsUUID()
  approved_by?: string;

  @IsOptional()
  @IsDateString()
  approved_at?: string;
}

