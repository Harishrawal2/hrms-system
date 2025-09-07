import { Request, Response, NextFunction } from 'express';
import { PerformanceService } from '../services/performance.service';
import { sendResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export class PerformanceController {
  private performanceService: PerformanceService;

  constructor() {
    this.performanceService = new PerformanceService();
  }

  createPerformanceReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const performance = await this.performanceService.createPerformanceReview(req.body, req.user!.id);
      sendResponse(res, 201, performance, 'Performance review created successfully');
    } catch (error) {
      next(error);
    }
  };

  getPerformanceReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.performanceService.getPerformanceReviews(req.query as any);
      sendResponse(res, 200, result, 'Performance reviews fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getPerformanceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const performance = await this.performanceService.getPerformanceById(req.params.id);
      sendResponse(res, 200, performance, 'Performance review fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  updatePerformanceReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const performance = await this.performanceService.updatePerformanceReview(req.params.id, req.body);
      sendResponse(res, 200, performance, 'Performance review updated successfully');
    } catch (error) {
      next(error);
    }
  };

  submitPerformanceReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const performance = await this.performanceService.submitPerformanceReview(req.params.id);
      sendResponse(res, 200, performance, 'Performance review submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  getPerformanceSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await this.performanceService.getPerformanceSummary(req.query as any);
      sendResponse(res, 200, summary, 'Performance summary fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}