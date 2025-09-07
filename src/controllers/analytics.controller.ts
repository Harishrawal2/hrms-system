import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { sendResponse } from '../utils/ApiResponse';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.analyticsService.getDashboardStats();
      sendResponse(res, 200, stats, 'Dashboard statistics fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getEmployeeAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const analytics = await this.analyticsService.getEmployeeAnalytics(req.query as any);
      sendResponse(res, 200, analytics, 'Employee analytics fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getAttendanceAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const analytics = await this.analyticsService.getAttendanceAnalytics(req.query as any);
      sendResponse(res, 200, analytics, 'Attendance analytics fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getLeaveAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const analytics = await this.analyticsService.getLeaveAnalytics(req.query as any);
      sendResponse(res, 200, analytics, 'Leave analytics fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getPayrollAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const analytics = await this.analyticsService.getPayrollAnalytics(req.query as any);
      sendResponse(res, 200, analytics, 'Payroll analytics fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}