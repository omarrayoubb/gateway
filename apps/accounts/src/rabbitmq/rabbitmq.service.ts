import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: any = null;
  private channel: amqp.Channel | null = null;
  private readonly exchange = 'user_events';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
    try {
      this.connection = await amqp.connect(rabbitmqUrl);
      if (this.connection) {
        this.channel = await this.connection.createChannel();
        
        if (this.channel) {
          // Declare exchange for user events
          await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
        }
      }
      
      console.log('RabbitMQ connected successfully');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      // Don't throw - allow app to continue without RabbitMQ
    }
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  async publishUserCreated(userData: any) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    
    const message = Buffer.from(JSON.stringify({
      event: 'user.created',
      data: userData,
      timestamp: new Date().toISOString(),
    }));

    this.channel.publish(this.exchange, 'user.created', message, { persistent: true });
    console.log('Published user.created event:', userData.id);
  }

  async publishUserUpdated(userData: any) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    
    const message = Buffer.from(JSON.stringify({
      event: 'user.updated',
      data: userData,
      timestamp: new Date().toISOString(),
    }));

    this.channel.publish(this.exchange, 'user.updated', message, { persistent: true });
    console.log('Published user.updated event:', userData.id);
  }

  async publishUserDeleted(userId: string) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    
    const message = Buffer.from(JSON.stringify({
      event: 'user.deleted',
      data: { id: userId },
      timestamp: new Date().toISOString(),
    }));

    this.channel.publish(this.exchange, 'user.deleted', message, { persistent: true });
    console.log('Published user.deleted event:', userId);
  }
}

