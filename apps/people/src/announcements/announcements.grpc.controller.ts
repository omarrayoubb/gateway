import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Controller()
export class AnnouncementsGrpcController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @GrpcMethod('AnnouncementService', 'GetAnnouncements')
  async getAnnouncements(data: { sort?: string }) {
    try {
      const announcements = await this.announcementsService.findAll({ sort: data.sort });
      return {
        announcements: announcements.map(announcement => this.mapAnnouncementToProto(announcement)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get announcements',
      });
    }
  }

  @GrpcMethod('AnnouncementService', 'CreateAnnouncement')
  async createAnnouncement(data: any) {
    try {
      if (!data.title) {
        throw new RpcException({
          code: 3,
          message: 'title is required',
        });
      }
      if (!data.content) {
        throw new RpcException({
          code: 3,
          message: 'content is required',
        });
      }
      if (!data.authorId) {
        throw new RpcException({
          code: 3,
          message: 'authorId is required',
        });
      }

      const createDto: CreateAnnouncementDto = {
        title: data.title,
        content: data.content,
        authorId: data.authorId || data.author_id,
        targetAudience: data.targetAudience || data.target_audience || undefined,
        targetDepartments: data.targetDepartments || data.target_departments || undefined,
        priority: data.priority || undefined,
        status: data.status || undefined,
      };

      const announcement = await this.announcementsService.create(createDto);
      return this.mapAnnouncementToProto(announcement);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create announcement',
      });
    }
  }

  private mapAnnouncementToProto(announcement: any) {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      authorId: announcement.authorId || announcement.author_id,
      targetAudience: announcement.targetAudience || announcement.target_audience || 'all',
      targetDepartments: announcement.targetDepartments || announcement.target_departments || [],
      priority: announcement.priority || 'normal',
      status: announcement.status || 'draft',
      createdAt: formatDateTime(announcement.createdAt),
    };
  }
}
