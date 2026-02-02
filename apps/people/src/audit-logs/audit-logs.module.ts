import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsGrpcController } from './audit-logs.grpc.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditLogsService],
  controllers: [AuditLogsGrpcController],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
