import { Prisma, Attendance, AttendanceStatus } from '@prisma/client';
import PrismaService from '../config/prisma';

const prisma = PrismaService.getInstance();

export interface CreateAttendanceData {
  employeeId: string;
  date: Date;
  clockIn: Date;
  clockOut?: Date;
  breakDuration?: number;
  status?: AttendanceStatus;
  location?: Prisma.LocationCreateInput;
  notes?: string;
}

export interface UpdateAttendanceData {
  clockIn?: Date;
  clockOut?: Date;
  breakDuration?: number;
  status?: AttendanceStatus;
  location?: Prisma.LocationCreateInput;
  notes?: string;
  approvedBy?: string;
}

export class AttendanceDAO {
  async create(data: CreateAttendanceData): Promise<Attendance> {
    return prisma.attendance.create({
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

  async findById(id: string): Promise<Attendance | null> {
    return prisma.attendance.findUnique({
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

  async findByEmployeeAndDate(employeeId: string, date: Date): Promise<Attendance | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: startOfDay,
          lte: endOfDay
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

  async findActiveClockIn(employeeId: string): Promise<Attendance | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today
        },
        clockOut: null
      }
    });
  }

  async findMany(filters: {
    employeeId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: AttendanceStatus;
    department?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ attendances: Attendance[]; total: number }> {
    const { employeeId, startDate, endDate, status, department, page = 1, limit = 31, sort } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.AttendanceWhereInput = {};
    
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    
    if (department) {
      where.employee = {
        professionalInfo: {
          path: ['department'],
          string_contains: department
        }
      };
    }
    
    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate
      };
    } else if (startDate) {
      where.date = { gte: startDate };
    }

    // Parse sort parameter
    let orderBy: any = { date: 'desc' };
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

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
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
      prisma.attendance.count({ where })
    ]);

    return { attendances, total };
  }

  async update(id: string, data: UpdateAttendanceData): Promise<Attendance> {
    // Calculate total hours if clockOut is provided
    let updateData = { ...data };
    
    if (data.clockOut) {
      const attendance = await this.findById(id);
      if (attendance && attendance.clockIn) {
        const totalMs = data.clockOut.getTime() - attendance.clockIn.getTime();
        const totalHours = Math.max(0, (totalMs / (1000 * 60 * 60)) - ((data.breakDuration || 0) / 60));
        const overtimeHours = Math.max(0, totalHours - 8);
        
        updateData.totalHours = totalHours;
        updateData.overtimeHours = overtimeHours;
      }
    }

    return prisma.attendance.update({
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

  async getAttendanceSummary(filters: {
    employeeId?: string;
    month?: number;
    year?: number;
  }): Promise<any[]> {
    const { employeeId, month, year } = filters;
    
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();
    
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const where: Prisma.AttendanceWhereInput = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    if (employeeId) where.employeeId = employeeId;

    return prisma.attendance.groupBy({
      by: ['employeeId'],
      where,
      _count: {
        _all: true
      },
      _sum: {
        totalHours: true,
        overtimeHours: true
      }
    });
  }

  async getMonthlyAttendance(employeeId: string, month: number, year: number): Promise<Attendance[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });
  }

  async delete(id: string): Promise<Attendance> {
    return prisma.attendance.delete({
      where: { id }
    });
  }
}