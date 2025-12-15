import { IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateTicketCommentDto {
  @IsUUID()
  @IsNotEmpty()
  ticketId: string;

  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsString()
  @IsNotEmpty()
  author: string;
}

