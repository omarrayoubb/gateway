import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller()
export class MessagesGrpcController {
  constructor(private readonly messagesService: MessagesService) {}

  @GrpcMethod('MessageService', 'GetMessages')
  async getMessages(data: { 
    sort?: string;
    recipientId?: string;
    senderId?: string;
  }) {
    try {
      const query = {
        sort: data.sort,
        recipient_id: data.recipientId,
        recipientId: data.recipientId,
        sender_id: data.senderId,
        senderId: data.senderId,
      };
      const messages = await this.messagesService.findAll(query);
      return {
        messages: messages.map(message => this.mapMessageToProto(message)),
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get messages',
      });
    }
  }

  @GrpcMethod('MessageService', 'CreateMessage')
  async createMessage(data: any) {
    try {
      if (!data.senderId) {
        throw new RpcException({
          code: 3,
          message: 'senderId is required',
        });
      }
      if (!data.recipientId) {
        throw new RpcException({
          code: 3,
          message: 'recipientId is required',
        });
      }
      if (!data.subject) {
        throw new RpcException({
          code: 3,
          message: 'subject is required',
        });
      }
      if (!data.content) {
        throw new RpcException({
          code: 3,
          message: 'content is required',
        });
      }

      const createDto: CreateMessageDto = {
        senderId: data.senderId || data.sender_id,
        recipientId: data.recipientId || data.recipient_id,
        subject: data.subject,
        content: data.content,
        read: data.read !== undefined ? data.read : false,
        attachments: data.attachments || undefined,
      };

      const message = await this.messagesService.create(createDto);
      return this.mapMessageToProto(message);
    } catch (error) {
      if (error.code !== undefined && error.message !== undefined) {
        throw error;
      }
      const code = error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to create message',
      });
    }
  }

  @GrpcMethod('MessageService', 'UpdateMessage')
  async updateMessage(data: any) {
    try {
      const updateDto: UpdateMessageDto = {
        read: data.read !== undefined ? data.read : undefined,
        readAt: data.readAt || data.read_at || undefined,
      };
      const message = await this.messagesService.update(data.id, updateDto);
      return this.mapMessageToProto(message);
    } catch (error) {
      const code = error.status === 404 ? 5 : error.status === 400 ? 3 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to update message',
      });
    }
  }

  @GrpcMethod('MessageService', 'DeleteMessage')
  async deleteMessage(data: { id: string }) {
    try {
      await this.messagesService.remove(data.id);
      return { success: true, message: 'Message deleted successfully' };
    } catch (error) {
      const code = error.status === 404 ? 5 : 2;
      throw new RpcException({
        code,
        message: error.message || 'Failed to delete message',
      });
    }
  }

  private mapMessageToProto(message: any) {
    const formatDateTime = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return '';
    };

    return {
      id: message.id,
      senderId: message.senderId || message.sender_id,
      recipientId: message.recipientId || message.recipient_id,
      subject: message.subject,
      content: message.content,
      read: message.read || false,
      readAt: formatDateTime(message.readAt || message.read_at),
      attachments: message.attachments || [],
      createdAt: formatDateTime(message.createdAt),
    };
  }
}
