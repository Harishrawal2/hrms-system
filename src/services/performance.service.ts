import { Performance, PerformanceStatus } from '@prisma/client';
import { PerformanceDAO, CreatePerformanceData, UpdatePerformanceData } from '../dao/performance.dao';
import { EmployeeDAO } from '../dao/employee.dao';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export class PerformanceService {
  private performanceDAO: PerformanceDAO;
  private employeeDAO: EmployeeDAO;

  constructor() {
    this.performanceDAO = new PerformanceDAO();
    this.employeeDAO = new EmployeeDAO();
  }

  async createPerformanceReview(data: CreatePerformanceData, reviewerId: string): Promise<Performance> {
    const employee = await this.employeeDAO.findByEmployeeId(data.employeeId);
    if (!employee) {
      throw new ApiError(404, 'Employee not found');
    }

    const reviewer = await this.employeeDAO.findByUserId(reviewerId);
    if (!reviewer) {
      throw new ApiError(404, 'Reviewer profile not found');
    }

    const performance = await this.performanceDAO.create({
      ...data,
      reviewedBy: reviewer.employeeId
    });

    logger.info(`Performance review created: ${performance.id} for employee ${data.employeeId}`);
    return performance;
  }

  async getPerformanceReviews(filters: {
    employeeId?: string;
    reviewedBy?: string;
    status?: PerformanceStatus;
    year?: number;
    page?: number;
    limit?: number;
  }): Promise<{ performances: Performance[]; total: number; pagination: any }> {
    const { page = 1, limit = 10 } = filters;
    const result = await this.performanceDAO.findMany(filters);

    return {
      ...result,
      pagination: {
        current: page,
        pages: Math.ceil(result.total / limit),
        total: result.total,
        limit
      }
    };
  }

  async getPerformanceById(id: string): Promise<Performance> {
    const performance = await this.performanceDAO.findById(id);
    if (!performance) {
      throw new ApiError(404, 'Performance review not found');
    }
    return performance;
  }

  async updatePerformanceReview(id: string, data: UpdatePerformanceData): Promise<Performance> {
    const performance = await this.performanceDAO.update(id, data);
    logger.info(`Performance review updated: ${id}`);
    return performance;
  }

  async submitPerformanceReview(id: string): Promise<Performance> {
    const performance = await this.performanceDAO.update(id, {
      status: 'SUBMITTED'
    });

    logger.info(`Performance review submitted: ${id}`);
    return performance;
  }

  async getPerformanceSummary(filters: {
    department?: string;
    year?: number;
  }): Promise<any> {
    return this.performanceDAO.getPerformanceSummary(filters);
  }
}