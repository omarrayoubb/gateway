import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(notificationData: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create(notificationData);
    return await this.notificationRepository.save(notification);
  }

  async findAll(userId: string, query: { read?: string; type?: string }): Promise<Notification[]> {
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (query.read !== undefined) {
      const isRead = query.read === 'true';
      queryBuilder.andWhere('notification.read = :read', { read: isRead });
    }

    if (query.type) {
      queryBuilder.andWhere('notification.type = :type', { type: query.type });
    }

    queryBuilder.orderBy('notification.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.findOne(id);

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    notification.read = true;
    notification.readAt = new Date();
    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.notificationRepository.update(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );

    return { count: result.affected || 0 };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, read: false },
    });
  }
}
