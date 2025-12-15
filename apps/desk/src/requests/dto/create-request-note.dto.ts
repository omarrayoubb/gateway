import { IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateRequestNoteDto {
  @IsUUID()
  @IsNotEmpty()
  requestId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  note: string;

  @IsString()
  @IsNotEmpty()
  noteOwner: string;
}

