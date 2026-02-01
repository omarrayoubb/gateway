import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { JobPostingsService } from './job-postings.service';
import { JobPostingsGrpcController } from './job-postings.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobPosting]),
  ],
  providers: [JobPostingsService],
  controllers: [JobPostingsGrpcController],
  exports: [JobPostingsService],
})
export class JobPostingsModule {}
