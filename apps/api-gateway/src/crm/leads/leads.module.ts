import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';

@Module({
  imports: [
    // Client is registered in CrmModule
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule { }
