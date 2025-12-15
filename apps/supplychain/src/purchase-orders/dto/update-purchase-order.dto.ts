import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseOrderDto } from './create-purchase-order.dto';
import { IsOptional, IsEnum, IsUUID, IsBoolean, IsDateString } from 'class-validator';
import { ApprovalStatus, PurchaseOrderStatus } from '../entities/purchase-order.entity';

export class UpdatePurchaseOrderDto extends PartialType(CreatePurchaseOrderDto) {
  @IsOptional()
  @IsEnum(ApprovalStatus)
  approvalStatus?: ApprovalStatus;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsUUID()
  submittedForApprovalBy?: string;

  @IsOptional()
  @IsDateString()
  submittedForApprovalAt?: string;

  @IsOptional()
  @IsUUID()
  approvedBy?: string;

  @IsOptional()
  @IsDateString()
  approvedAt?: string;

  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;
}

