import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSync } from '../users/users-sync.entity';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: any = null;
  private channel: amqp.Channel | null = null;
  private readonly exchange = 'user_events';
  private readonly queue = 'crm_user_sync';

  constructor(
    private configService: ConfigService,
    @InjectRepository(UserSync)
    private userSyncRepository: Repository<UserSync>,
  ) {}

  async onModuleInit() {
    const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
    try {
      this.connection = await amqp.connect(rabbitmqUrl);
      if (this.connection) {
        this.channel = await this.connection.createChannel();
        
        if (this.channel) {
          // Declare exchange
          await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
          
          // Declare queue
          await this.channel.assertQueue(this.queue, { durable: true });
          
          // Bind queue to exchange for user events
          await this.channel.bindQueue(this.queue, this.exchange, 'user.*');
          
          // Consume messages
          await this.channel.consume(this.queue, async (msg) => {
            if (msg) {
              try {
                const content = JSON.parse(msg.content.toString());
                await this.handleUserEvent(content);
                if (this.channel) {
                  this.channel.ack(msg);
                }
              } catch (error) {
                console.error('Error processing user event:', error);
                if (this.channel) {
                  this.channel.nack(msg, false, false); // Reject and don't requeue
                }
              }
            }
          });
        }
      }
      
      console.log('RabbitMQ connected and listening for user events');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      // Don't throw - allow app to continue without RabbitMQ
    }
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  private async handleUserEvent(event: any) {
    switch (event.event) {
      case 'user.created':
        await this.handleUserCreated(event.data);
        break;
      case 'user.updated':
        await this.handleUserUpdated(event.data);
        break;
      case 'user.deleted':
        await this.handleUserDeleted(event.data.id);
        break;
      default:
        console.log('Unknown event type:', event.event);
    }
  }

  private async handleUserCreated(userData: any) {
    const userSync = this.userSyncRepository.create({
      id: userData.id,
      workId: userData.workId,
      email: userData.email,
      name: userData.name,
      timezone: userData.timezone,
      workLocation: userData.workLocation,
      department: userData.department,
      deptManager: userData.deptManager,
      birthday: userData.birthday ? new Date(userData.birthday) : null,
      roleId: userData.roleId,
      profileId: userData.profileId,
    });
    
    await this.userSyncRepository.save(userSync);
    console.log('User synced to CRM:', userData.id);
  }

  private async handleUserUpdated(userData: any) {
    const existingUser = await this.userSyncRepository.findOne({ where: { id: userData.id } });
    
    if (existingUser) {
      existingUser.workId = userData.workId;
      existingUser.email = userData.email;
      existingUser.name = userData.name;
      existingUser.timezone = userData.timezone;
      existingUser.workLocation = userData.workLocation;
      existingUser.department = userData.department;
      existingUser.deptManager = userData.deptManager;
      existingUser.birthday = userData.birthday ? new Date(userData.birthday) : null;
      existingUser.roleId = userData.roleId;
      existingUser.profileId = userData.profileId;
      
      await this.userSyncRepository.save(existingUser);
      console.log('User updated in CRM:', userData.id);
    } else {
      // If user doesn't exist, create it
      await this.handleUserCreated(userData);
    }
  }

  private async handleUserDeleted(userId: string) {
    const user = await this.userSyncRepository.findOne({ where: { id: userId } });
    if (user) {
      await this.userSyncRepository.remove(user);
      console.log('User deleted from CRM:', userId);
    }
  }
}

