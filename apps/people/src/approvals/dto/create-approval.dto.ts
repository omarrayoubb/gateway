import { IsEnum, IsUUID, IsArray, IsOptional } from 'class-validator';
import { RequestType } from '../entities/approval.entity';

export class CreateApprovalDto {
  @IsEnum(RequestType)
  requestType: RequestType;

  @IsUUID()
  requestId: string;

  @IsUUID()
  requesterId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  approvalChain?: string[];
}
