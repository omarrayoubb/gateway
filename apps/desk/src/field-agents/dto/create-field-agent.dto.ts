import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFieldAgentDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

