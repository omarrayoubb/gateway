import { IsString, IsUUID, IsNotEmpty, IsIn } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  note: string;

  @IsString()
  @IsNotEmpty()
  noteOwner: string;

  @IsString()
  @IsIn(['ticket', 'request', 'estimate', 'work_order'])
  relatedType: string;

  @IsUUID()
  @IsNotEmpty()
  relatedId: string;
}

