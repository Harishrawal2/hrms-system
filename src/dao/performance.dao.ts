import { Prisma, Performance, PerformanceStatus } from '@prisma/client';
import PrismaService from '../config/prisma';

const prisma = PrismaService.getInstance();

export interface CreatePerformanceData {
  employeeId: string;
  reviewPeriod: Prisma.ReviewPeriodCreateInput;
  goals?: Prisma.GoalCreateInput[];
  ratings: Prisma.RatingsCreateInput;
  feedback?: Prisma.FeedbackCreateInput;
  reviewedBy: string;
  nextReviewDate: Date;
}

export interface UpdatePerformanceData {
  goals?: Prisma.GoalCreateInput[];
  ratings?: Prisma.RatingsCreateInput;
  feedback?: Prisma.FeedbackCreateInput;
  status?: PerformanceStatus;
  reviewDate?: Date;
  nextReviewDate?: Date;
}

export class PerformanceDAO {
  async create(data: CreatePerformanceData): Promise<Performance> {
    // Calculate overall rating
    const ratings = data.ratings as any;
    const overall = (ratings.technical + ratings.communication + ratings.teamwork + 
                    ratings.leadership + ratings.punctuality) / 5;

    return prisma.performance.create({
      data: {
        ...data,
        ratings: {
          ...ratings,
          overall: Math.round(overall * 100) / 100
        }
      },
      include: {
        employee: {
          select: {
            employeeId: true,
            personalInfo: true
          }
        }
      }
    });
  }

  async findById(id: string): Promise<Performance | null> {
    return prisma.performance.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            employeeId: true,
            personalInfo: true
          }
        }
      }
    });
  }

  async findMany(filters: {
    employeeId?: string;
    reviewedBy?: string;
    status?: PerformanceStatus;
    year?: number;
    page?: number;
    limit?: number;
  }): Promise<{ performances: Performance[]; total: number }> {
    const { employeeId, reviewedBy, status, year, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.PerformanceWhereInput = {};
    
    if (employeeId) where.employeeId = employeeId;
    if (reviewedBy) where.reviewedBy = reviewedBy;
    if (status) where.status = status;
    
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      where.reviewDate = {
        gte: startDate,
        lte: endDate
      };
    }

    const [performances, total] = await Promise.all([
      prisma.performance.findMany({
        where,
        include: {
          employee: {
            select: {
              employeeId: true,
              personalInfo: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { reviewDate: 'desc' }
      }),
      prisma.performance.count({ where })
    ]);

    return { performances, total };
  }

  async update(id: string, data: UpdatePerformanceData): Promise<Performance> {
    // Recalculate overall rating if ratings are updated
    let updateData = { ...data };
    if (data.ratings) {
      const ratings = data.ratings as any;
      const overall = (ratings.technical + ratings.communication + ratings.teamwork + 
                      ratings.leadership + ratings.punctuality) / 5;
      updateData.ratings = {
        ...ratings,
        overall: Math.round(overall * 100) / 100
      };
    }

    return prisma.performance.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            employeeId: true,
            personalInfo: true
          }
        }
      }
    });
  }

  async getPerformanceSummary(filters: {
    department?: string;
    year?: number;
  }): Promise<any> {
    const { year } = filters;
    
    const where: Prisma.PerformanceWhereInput = {};
    
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      where.reviewDate = {
        gte: startDate,
        lte: endDate
      };
    }

    return prisma.performance.aggregate({
      where,
      _avg: {
        ratings: {
          path: ['overall']
        }
      },
      _count: {
        _all: true
      }
    });
  }

  async delete(id: string): Promise<Performance> {
    return prisma.performance.delete({
      where: { id }
    });
  }
}