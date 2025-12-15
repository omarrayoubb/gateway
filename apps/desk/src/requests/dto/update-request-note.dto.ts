import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestNoteDto } from './create-request-note.dto';

export class UpdateRequestNoteDto extends PartialType(CreateRequestNoteDto) {}

