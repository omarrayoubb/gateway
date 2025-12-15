import { PartialType } from '@nestjs/mapped-types';
import { CreateFieldAgentDto } from './create-field-agent.dto';

export class UpdateFieldAgentDto extends PartialType(CreateFieldAgentDto) {}

