import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';

@Module({
  imports: [
    // Client is registered in CrmModule
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule { }

