import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from './auth.middleware';

const authService = new AuthService();

export const requirePermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      const hasPermission = await authService.hasPermission(req.user.id, permission);
      if (!hasPermission) {
        throw new ApiError(403, `Permission denied: ${permission}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAnyPermission = (permissions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      const hasAnyPermission = await Promise.all(
        permissions.map(permission => authService.hasPermission(req.user!.id, permission))
      );

      if (!hasAnyPermission.some(Boolean)) {
        throw new ApiError(403, `Permission denied. Required: ${permissions.join(' OR ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};