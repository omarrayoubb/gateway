import { Module } from '@nestjs/common';
import { RFQsService } from './rfqs.service';
import { RFQsController } from './rfqs.controller';

@Module({
  imports: [
    // Client is registered in CrmModule
  ],
  controllers: [RFQsController],
  providers: [RFQsService],
  exports: [RFQsService],
})
export class RFQsModule {}

