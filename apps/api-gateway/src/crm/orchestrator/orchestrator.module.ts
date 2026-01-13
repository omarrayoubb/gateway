import { Module } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { OrchestratorController } from './orchestrator.controller';

@Module({
  imports: [
    // Client is registered in CrmModule
  ],
  controllers: [OrchestratorController],
  providers: [OrchestratorService],
  exports: [OrchestratorService],
})
export class OrchestratorModule { }

