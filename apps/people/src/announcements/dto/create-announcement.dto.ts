import { IsString, IsUUID, IsArray, IsEnum, IsOptional } from 'class-validator';
import { TargetAudience, AnnouncementPriority, AnnouncementStatus } from '../entities/announcement.entity';

export class CreateAnnouncementDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsUUID()
  authorId: string;

  @IsEnum(TargetAudience)
  @IsOptional()
  targetAudience?: TargetAudience;

  @IsArray()
  @IsOptional()
  targetDepartments?: string[];

  @IsEnum(AnnouncementPriority)
  @IsOptional()
  priority?: AnnouncementPriority;

  @IsEnum(AnnouncementStatus)
  @IsOptional()
  status?: AnnouncementStatus;
}
