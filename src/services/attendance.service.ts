import { Attendance, AttendanceStatus } from '@prisma/client';
import { AttendanceDAO, CreateAttendanceData, UpdateAttendanceData } from '../dao/attendance.dao';
import { EmployeeDAO } from '../dao/employee.dao';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export class AttendanceService {
  private attendanceDAO: AttendanceDAO;
  private employeeDAO: EmployeeDAO;

  constructor() {
    this.attendanceDAO = new AttendanceDAO();
    this.employeeDAO = new EmployeeDAO();
  }

  async clockIn(data: {
    userId?: string;
    employeeId?: string;
    location?: any;
    notes?: string;
  }): Promise<Attendance> {
    let employee;
    if (data.employeeId) {
      employee = await this.employeeDAO.findByEmployeeId(data.employeeId);
    } else if (data.userId) {
      employee = await this.employeeDAO.findByUserId(data.userId);
    }
    
    if (!employee) {
      throw new ApiError(404, 'Employee not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await this.attendanceDAO.findByEmployeeAndDate(employee.employeeId, today);
    if (existingAttendance) {
      throw new ApiError(400, 'Already clocked in today');
    }

    const attendance = await this.attendanceDAO.create({
      employeeId: employee.employeeId,
      date: today,
      clockIn: new Date(),
      location: data.location,
      notes: data.notes,
      status: data.location?.type === 'REMOTE' ? 'WORK_FROM_HOME' : 'PRESENT'
    });

    logger.info(`Employee clocked in: ${employee.employeeId}`);
    return attendance;
  }

  async clockOut(data: {
    userId?: string;
    employeeId?: string;
    notes?: string;
    breakDuration?: number;
  }): Promise<Attendance> {
    let employee;
    if (data.employeeId) {
      employee = await this.employeeDAO.findByEmployeeId(data.employeeId);
    } else if (data.userId) {
      employee = await this.employeeDAO.findByUserId(data.userId);
    }
    
    if (!employee) {
      throw new ApiError(404, 'Employee not found');
    }

    const activeAttendance = await this.attendanceDAO.findActiveClockIn(employee.employeeId);
    if (!activeAttendance) {
      throw new ApiError(400, 'No active clock-in found for today');
    }

    const clockOut = new Date();
    const totalMs = clockOut.getTime() - activeAttendance.clockIn.getTime();
    const totalHours = Math.max(0, (totalMs / (1000 * 60 * 60)) - ((data.breakDuration || 0) / 60));
    const overtimeHours = Math.max(0, totalHours - 8);

    const attendance = await this.attendanceDAO.update(activeAttendance.id, {
      clockOut,
      breakDuration: data.breakDuration || 0,
      totalHours,
      overtimeHours,
      notes: data.notes || activeAttendance.notes
    });

    logger.info(`Employee clocked out: ${employee.employeeId}`);
    return attendance;
  }

  async getAttendance(filters: {
    employeeId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ attendances: Attendance[]; total: number; summary: any; pagination: any }> {
    const { page = 1, limit = 31 } = filters;
    
    // Set default date range to current month if not provided
    if (!filters.startDate && !filters.endDate) {
      const now = new Date();
      filters.startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      filters.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const result = await this.attendanceDAO.findMany(filters);
    
    // Calculate summary
    const summary = result.attendances.reduce((acc, att) => {
      acc.totalDays++;
      if (['PRESENT', 'WORK_FROM_HOME'].includes(att.status)) acc.presentDays++;
      acc.totalHours += att.totalHours;
      acc.overtimeHours += att.overtimeHours;
      return acc;
    }, { totalDays: 0, presentDays: 0, totalHours: 0, overtimeHours: 0 });

    return {
      ...result,
      summary,
      pagination: {
        current: page,
        pages: Math.ceil(result.total / limit),
        total: result.total,
        limit
      }
    };
  }

  async updateAttendance(id: string, data: UpdateAttendanceData): Promise<Attendance> {
    const attendance = await this.attendanceDAO.update(id, data);
    logger.info(`Attendance updated: ${id}`);
    return attendance;
  }

  async getAttendanceSummary(filters: {
    employeeId?: string;
    month?: number;
    year?: number;
  }): Promise<any> {
    return this.attendanceDAO.getAttendanceSummary(filters);
  }

  async getMonthlyAttendance(employeeId: string, month: number, year: number): Promise<Attendance[]> {
    return this.attendanceDAO.getMonthlyAttendance(employeeId, month, year);
  }
}