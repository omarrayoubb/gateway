import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
  ) {}

  async findAll(query: { sort?: string }): Promise<Announcement[]> {
    const queryBuilder = this.announcementRepository.createQueryBuilder('announcement');

    // Handle sorting
    if (query.sort) {
      const sortField = query.sort.startsWith('-') ? query.sort.substring(1) : query.sort;
      const order = query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const fieldMap: Record<string, string> = {
        'created_at': 'createdAt',
        'created_date': 'createdAt',
      };
      const dbField = fieldMap[sortField] || sortField;
      queryBuilder.orderBy(`announcement.${dbField}`, order);
    } else {
      queryBuilder.orderBy('announcement.createdAt', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async create(createAnnouncementDto: CreateAnnouncementDto): Promise<Announcement> {
    const announcement = this.announcementRepository.create({
      ...createAnnouncementDto,
    });

    return await this.announcementRepository.save(announcement);
  }
}
