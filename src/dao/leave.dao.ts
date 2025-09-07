import { Prisma, Leave, LeaveStatus, LeaveType } from '@prisma/client';
import PrismaService from '../config/prisma';

const prisma = PrismaService.getInstance();

export interface CreateLeaveData {
  employeeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  isHalfDay?: boolean;
  emergencyContact?: Prisma.EmergencyContactInfoCreateInput;
  documents?: Prisma.LeaveDocumentCreateInput[];
}

export interface UpdateLeaveData {
  status?: LeaveStatus;
  approvedBy?: string;
  approvedDate?: Date;
  rejectionReason?: string;
}

export class LeaveDAO {
  async create(data: CreateLeaveData): Promise<Leave> {
    // Calculate total days
    const timeDiff = data.endDate.getTime() - data.startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    const totalDays = data.isHalfDay && daysDiff === 1 ? 0.5 : daysDiff;

    return prisma.leave.create({
      data: {
        ...data,
        totalDays,
        appliedDate: new Date()
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

  async findById(id: string): Promise<Leave | null> {
    return prisma.leave.findUnique({
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
    status?: LeaveStatus;
    leaveType?: LeaveType;
    startDate?: Date;
    endDate?: Date;
    department?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ leaves: Leave[]; total: number }> {
    const { employeeId, status, leaveType, startDate, endDate, department, page = 1, limit = 10, sort } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.LeaveWhereInput = {};
    
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (leaveType) where.leaveType = leaveType;
    
    if (department) {
      where.employee = {
        professionalInfo: {
          path: ['department'],
          string_contains: department
        }
      };
    }
    
    if (startDate && endDate) {
      where.startDate = {
        gte: startDate,
        lte: endDate
      };
    }

    // Parse sort parameter
    let orderBy: any = { appliedDate: 'desc' };
    if (sort) {
      const sortFields = sort.split(',');
      orderBy = {};
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          orderBy[field.substring(1)] = 'desc';
        } else {
          orderBy[field] = 'asc';
        }
      });
    }

    const [leaves, total] = await Promise.all([
      prisma.leave.findMany({
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
        orderBy
      }),
      prisma.leave.count({ where })
    ]);

    return { leaves, total };
  }

  async update(id: string, data: UpdateLeaveData): Promise<Leave> {
    return prisma.leave.update({
      where: { id },
      data,
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

  async checkOverlappingLeaves(employeeId: string, startDate: Date, endDate: Date, excludeId?: string): Promise<Leave | null> {
    const where: Prisma.LeaveWhereInput = {
      employeeId,
      status: {
        in: ['PENDING', 'APPROVED']
      },
      OR: [
        {
          AND: [
            { startDate: { lte: endDate } },
            { endDate: { gte: startDate } }
          ]
        }
      ]
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    return prisma.leave.findFirst({ where });
  }

  async getLeaveBalance(employeeId: string, year?: number): Promise<any> {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31);

    const leaveUsage = await prisma.leave.groupBy({
      by: ['leaveType'],
      where: {
        employeeId,
        status: 'APPROVED',
        startDate: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        totalDays: true
      }
    });

    // Standard leave policies (configurable)
    const leavePolicies = {
      EARNED: 21,
      SICK: 12,
      CASUAL: 7,
      MATERNITY: 182,
      PATERNITY: 15,
      BEREAVEMENT: 5,
      COMPENSATORY: 10
    };

    const leaveBalance: any = {};
    Object.entries(leavePolicies).forEach(([type, total]) => {
      const used = leaveUsage.find(leave => leave.leaveType === type)?._sum.totalDays || 0;
      leaveBalance[type.toLowerCase()] = {
        total,
        used,
        remaining: total - used
      };
    });

    return leaveBalance;
  }

  async delete(id: string): Promise<Leave> {
    return prisma.leave.delete({
      where: { id }
    });
  }
}