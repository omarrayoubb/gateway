import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsGrpcController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @GrpcMethod('NotificationService', 'GetNotifications')
  async getNotifications(data: any) {
    try {
      const notifications = await this.notificationsService.findAll(
        data.userId || data.user_id,
        {
          read: data.read,
          type: data.type,
        },
      );
      return {
        notifications: notifications.map(n => this.mapNotificationToProto(n)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get notifications',
      });
    }
  }

  @GrpcMethod('NotificationService', 'MarkAsRead')
  async markAsRead(data: any) {
    try {
      const notification = await this.notificationsService.markAsRead(
        data.id,
        data.userId || data.user_id,
      );
      return this.mapNotificationToProto(notification);
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to mark notification as read',
      });
    }
  }

  @GrpcMethod('NotificationService', 'MarkAllAsRead')
  async markAllAsRead(data: any) {
    try {
      const result = await this.notificationsService.markAllAsRead(data.userId || data.user_id);
      return result;
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to mark all notifications as read',
      });
    }
  }

  @GrpcMethod('NotificationService', 'GetUnreadCount')
  async getUnreadCount(data: any) {
    try {
      const count = await this.notificationsService.getUnreadCount(data.userId || data.user_id);
      return { count };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get unread count',
      });
    }
  }

  private mapNotificationToProto(notification: any) {
    return {
      id: notification.id,
      userId: notification.userId || notification.user_id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      relatedEntityType: notification.relatedEntityType || notification.related_entity_type || '',
      relatedEntityId: notification.relatedEntityId || notification.related_entity_id || '',
      read: notification.read,
      readAt: notification.readAt ? notification.readAt.toISOString() : '',
      createdAt: notification.createdAt ? notification.createdAt.toISOString() : '',
    };
  }
}
