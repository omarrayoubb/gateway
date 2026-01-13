import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';

@Module({
  imports: [
    // Client is registered in CrmModule
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule { }

