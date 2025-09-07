import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';
import { AuthService } from '../services/auth.service';
import { ApiError } from '../utils/ApiError';

export interface AuthRequest extends Request {
  user?: User;
  token?: string;
}

const authService = new AuthService();

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Access token required');
    }

    const user = await authService.verifyToken(token);
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid token or user not found');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }

    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const user = await authService.verifyToken(token);
      if (user && user.isActive) {
        req.user = user;
        req.token = token;
      }
    }

    next();
  } catch (error) {
    // Don't throw error for optional auth, just continue without user
    next();
  }
};