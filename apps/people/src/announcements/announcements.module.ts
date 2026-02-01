import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement } from './entities/announcement.entity';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsGrpcController } from './announcements.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Announcement]),
  ],
  providers: [AnnouncementsService],
  controllers: [AnnouncementsGrpcController],
  exports: [AnnouncementsService],
})
export class AnnouncementsModule {}
