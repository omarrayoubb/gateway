import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create({
      ...createMessageDto,
    });

    return await this.messageRepository.save(message);
  }

  async findAll(query: { 
    sort?: string;
    recipient_id?: string;
    recipientId?: string;
    sender_id?: string;
    senderId?: string;
  }): Promise<Message[]> {
    const queryBuilder = this.messageRepository.createQueryBuilder('message');

    // Filter by recipient_id if provided
    const recipientId = query.recipient_id || query.recipientId;
    if (recipientId) {
      queryBuilder.where('message.recipientId = :recipientId', { recipientId });
    }

    // Filter by sender_id if provided
    const senderId = query.sender_id || query.senderId;
    if (senderId) {
      const whereCondition = recipientId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('message.senderId = :senderId', { senderId });
    }

    // Handle sorting
    if (query.sort) {
      const sortField = query.sort.startsWith('-') ? query.sort.substring(1) : query.sort;
      const order = query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap: Record<string, string> = {
        'created_at': 'createdAt',
        'read_at': 'readAt',
      };
      const dbField = fieldMap[sortField] || sortField;
      queryBuilder.orderBy(`message.${dbField}`, order);
    } else {
      queryBuilder.orderBy('message.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return message;
  }

  async update(id: string, updateMessageDto: UpdateMessageDto): Promise<Message> {
    const message = await this.findOne(id);
    
    const updateData: any = { ...updateMessageDto };
    if (updateMessageDto.readAt) {
      updateData.readAt = new Date(updateMessageDto.readAt);
    }

    Object.assign(message, updateData);
    return await this.messageRepository.save(message);
  }

  async remove(id: string): Promise<void> {
    const message = await this.findOne(id);
    await this.messageRepository.remove(message);
  }
}
