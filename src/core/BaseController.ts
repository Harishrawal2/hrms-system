import { Request, Response, NextFunction } from 'express';
import { IServiceResponse } from '../types/common.types';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

/**
 * Interface for authenticated requests
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions?: string[];
    employeeId?: string;
  };
  token?: string;
}

/**
 * Abstract base controller class implementing common HTTP handling patterns
 * Provides standardized request/response handling with error management
 */
export abstract class BaseController {
  protected entityName: string;

  constructor(entityName: string) {
    this.entityName = entityName;
  }

  /**
   * Generic request handler wrapper with error handling
   */
  protected handleRequest = <T>(
    serviceMethod: (req: AuthenticatedRequest) => Promise<IServiceResponse<T>>,
    successMessage?: string
  ) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const startTime = Date.now();
        
        // Log request
        logger.info(`${req.method} ${req.path}`, {
          userId: req.user?.id,
          params: req.params,
          query: req.query,
          body: this.sanitizeLogData(req.body)
        });

        // Execute service method
        const result = await serviceMethod(req);

        // Log response time
        const responseTime = Date.now() - startTime;
        logger.info(`Request completed in ${responseTime}ms`, {
          method: req.method,
          path: req.path,
          statusCode: 200,
          responseTime
        });

        // Send response
        const message = successMessage || result.message || 'Operation completed successfully';
        res.status(200).json(new ApiResponse(200, result.data, message));
      } catch (error) {
        next(error);
      }
    };
  };

  /**
   * Handle create operations
   */
  protected handleCreate = <T>(
    serviceMethod: (data: any, userId?: string) => Promise<IServiceResponse<T>>
  ) => {
    return this.handleRequest<T>(async (req: AuthenticatedRequest) => {
      return serviceMethod(req.body, req.user?.id);
    }, `${this.entityName} created successfully`);
  };

  /**
   * Handle get by ID operations
   */
  protected handleGetById = <T>(
    serviceMethod: (id: string, userId?: string) => Promise<IServiceResponse<T>>
  ) => {
    return this.handleRequest<T>(async (req: AuthenticatedRequest) => {
      return serviceMethod(req.params.id, req.user?.id);
    }, `${this.entityName} retrieved successfully`);
  };

  /**
   * Handle get many operations with pagination
   */
  protected handleGetMany = <T>(
    serviceMethod: (options: any, userId?: string) => Promise<IServiceResponse<T>>
  ) => {
    return this.handleRequest<T>(async (req: AuthenticatedRequest) => {
      const options = {
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };
      return serviceMethod(options, req.user?.id);
    }, `${this.entityName} list retrieved successfully`);
  };

  /**
   * Handle update operations
   */
  protected handleUpdate = <T>(
    serviceMethod: (id: string, data: any, userId?: string) => Promise<IServiceResponse<T>>
  ) => {
    return this.handleRequest<T>(async (req: AuthenticatedRequest) => {
      return serviceMethod(req.params.id, req.body, req.user?.id);
    }, `${this.entityName} updated successfully`);
  };

  /**
   * Handle delete operations
   */
  protected handleDelete = (
    serviceMethod: (id: string, userId?: string) => Promise<IServiceResponse<void>>
  ) => {
    return this.handleRequest<void>(async (req: AuthenticatedRequest) => {
      return serviceMethod(req.params.id, req.user?.id);
    }, `${this.entityName} deleted successfully`);
  };

  /**
   * Handle custom operations
   */
  protected handleCustomOperation = <T>(
    serviceMethod: (req: AuthenticatedRequest) => Promise<IServiceResponse<T>>,
    successMessage?: string
  ) => {
    return this.handleRequest<T>(serviceMethod, successMessage);
  };

  /**
   * Extract pagination parameters from request
   */
  protected getPaginationParams(req: Request) {
    return {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: Math.min(parseInt(req.query.limit as string) || 10, 100), // Max 100 items per page
      sort: req.query.sort as string
    };
  }

  /**
   * Extract filter parameters from request
   */
  protected getFilterParams(req: Request, allowedFilters: string[] = []) {
    const filters: any = {};
    
    // Add common filters
    if (req.query.search) filters.search = req.query.search;
    if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

    // Add allowed custom filters
    allowedFilters.forEach(filter => {
      if (req.query[filter] !== undefined) {
        filters[filter] = req.query[filter];
      }
    });

    return filters;
  }

  /**
   * Validate required parameters
   */
  protected validateRequiredParams(req: Request, requiredParams: string[]) {
    const missing = requiredParams.filter(param => !req.params[param]);
    if (missing.length > 0) {
      throw new ApiError(400, `Missing required parameters: ${missing.join(', ')}`);
    }
  }

  /**
   * Validate required query parameters
   */
  protected validateRequiredQuery(req: Request, requiredQuery: string[]) {
    const missing = requiredQuery.filter(param => !req.query[param]);
    if (missing.length > 0) {
      throw new ApiError(400, `Missing required query parameters: ${missing.join(', ')}`);
    }
  }

  /**
   * Sanitize sensitive data for logging
   */
  private sanitizeLogData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...data };

    Object.keys(sanitized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Send success response
   */
  protected sendSuccess<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200) {
    res.status(statusCode).json(new ApiResponse(statusCode, data, message));
  }

  /**
   * Send error response
   */
  protected sendError(res: Response, message: string, statusCode: number = 400, errors?: string[]) {
    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors
    });
  }

  /**
   * Handle file upload operations
   */
  protected handleFileUpload = <T>(
    serviceMethod: (file: Express.Multer.File, data: any, userId?: string) => Promise<IServiceResponse<T>>
  ) => {
    return this.handleRequest<T>(async (req: AuthenticatedRequest) => {
      if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
      }
      return serviceMethod(req.file, req.body, req.user?.id);
    }, 'File uploaded successfully');
  };

  /**
   * Handle bulk operations
   */
  protected handleBulkOperation = <T>(
    serviceMethod: (data: any[], userId?: string) => Promise<IServiceResponse<T>>
  ) => {
    return this.handleRequest<T>(async (req: AuthenticatedRequest) => {
      if (!Array.isArray(req.body)) {
        throw new ApiError(400, 'Request body must be an array');
      }
      return serviceMethod(req.body, req.user?.id);
    }, 'Bulk operation completed successfully');
  };

  /**
   * Handle async operations with progress tracking
   */
  protected handleAsyncOperation = <T>(
    serviceMethod: (data: any, userId?: string) => Promise<IServiceResponse<T>>
  ) => {
    return this.handleRequest<T>(async (req: AuthenticatedRequest) => {
      // For long-running operations, you might want to implement job queues
      return serviceMethod(req.body, req.user?.id);
    }, 'Operation initiated successfully');
  };
}