import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AuditLogsService } from './audit-logs.service';

@Controller()
export class AuditLogsGrpcController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @GrpcMethod('AuditLogService', 'GetAuditLogs')
  async getAuditLogs(data: any) {
    try {
      const result = await this.auditLogsService.findAll({
        userId: data.userId || data.user_id,
        action: data.action,
        entityType: data.entityType || data.entity_type,
        dateFrom: data.dateFrom || data.date_from,
        dateTo: data.dateTo || data.date_to,
        page: data.page ? parseInt(data.page) : undefined,
        limit: data.limit ? parseInt(data.limit) : undefined,
      });
      return {
        auditLogs: result.data.map(log => this.mapAuditLogToProto(log)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      throw new RpcException({
        code: 2,
        message: error.message || 'Failed to get audit logs',
      });
    }
  }

  private mapAuditLogToProto(log: any) {
    return {
      id: log.id,
      userId: log.userId || log.user_id || '',
      action: log.action,
      entityType: log.entityType || log.entity_type || '',
      entityId: log.entityId || log.entity_id || '',
      changes: log.changes ? JSON.stringify(log.changes) : '',
      ipAddress: log.ipAddress || log.ip_address || '',
      userAgent: log.userAgent || log.user_agent || '',
      createdAt: log.createdAt ? log.createdAt.toISOString() : '',
    };
  }
}
