import { Request, Response, NextFunction } from 'express';
import { AuditLogDAO } from '../dao/auditLog.dao';
import { AuthRequest } from './auth.middleware';

const auditLogDAO = new AuditLogDAO();

export const auditLog = (action: string, resource: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user) {
        await auditLogDAO.create({
          userId: req.user.id,
          action,
          resource,
          resourceId: req.params.id,
          newData: req.body,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
      }
      next();
    } catch (error) {
      // Don't fail the request if audit logging fails
      console.error('Audit logging failed:', error);
      next();
    }
  };
};