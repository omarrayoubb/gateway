import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { LeadsModule } from './leads/leads.module';
import { ProfilesModule } from './profiles/profiles.module';

@Module({
  imports: [
    LeadsModule,
    ProfilesModule,
  ],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [LeadsModule, ProfilesModule],
})
export class CrmModule {}
