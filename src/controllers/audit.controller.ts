import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';
import { sendResponse } from '../utils/ApiResponse';

export class AuditController {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.auditService.getAuditLogs(req.query as any);
      sendResponse(res, 200, result, 'Audit logs fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}