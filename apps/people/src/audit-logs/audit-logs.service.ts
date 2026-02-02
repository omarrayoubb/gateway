import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(auditLogData: {
    userId?: string;
    action: AuditAction;
    entityType?: string;
    entityId?: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(auditLogData);
    return await this.auditLogRepository.save(auditLog);
  }

  async findAll(query: {
    userId?: string;
    action?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: AuditLog[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit_log');

    if (query.userId) {
      queryBuilder.where('audit_log.userId = :userId', { userId: query.userId });
    }

    if (query.action) {
      const whereCondition = query.userId ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('audit_log.action = :action', { action: query.action });
    }

    if (query.entityType) {
      const whereCondition = (query.userId || query.action) ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('audit_log.entityType = :entityType', { entityType: query.entityType });
    }

    if (query.dateFrom) {
      const whereCondition = (query.userId || query.action || query.entityType) ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('audit_log.createdAt >= :dateFrom', { dateFrom: query.dateFrom });
    }

    if (query.dateTo) {
      const whereCondition = (query.userId || query.action || query.entityType || query.dateFrom) ? 'andWhere' : 'where';
      queryBuilder[whereCondition]('audit_log.createdAt <= :dateTo', { dateTo: query.dateTo });
    }

    const total = await queryBuilder.getCount();

    queryBuilder.orderBy('audit_log.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const data = await queryBuilder.getMany();

    return { data, total, page, limit };
  }
}
