import { AuditLog } from '@prisma/client';
import { AuditLogDAO } from '../dao/auditLog.dao';
import { PaginationHelper } from '../utils/pagination';

export class AuditService {
  private auditLogDAO: AuditLogDAO;

  constructor() {
    this.auditLogDAO = new AuditLogDAO();
  }

  async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ logs: AuditLog[]; total: number; pagination: any }> {
    const { page = 1, limit = 50 } = filters;
    const result = await this.auditLogDAO.findMany(filters);

    return PaginationHelper.createPaginationResult(
      result.logs,
      result.total,
      page,
      limit
    );
  }
}