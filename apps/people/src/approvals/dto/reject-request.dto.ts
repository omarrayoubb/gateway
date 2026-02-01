import { IsString } from 'class-validator';

export class RejectRequestDto {
  @IsString()
  rejectionReason: string;
}
