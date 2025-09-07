import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { sendResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export class AttendanceController {
  private attendanceService: AttendanceService;

  constructor() {
    this.attendanceService = new AttendanceService();
  }

  clockIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const attendance = await this.attendanceService.clockIn({
        ...req.body,
        userId: req.user!.id
      });
      sendResponse(res, 201, attendance, 'Clocked in successfully');
    } catch (error) {
      next(error);
    }
  };

  clockOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const attendance = await this.attendanceService.clockOut({
        ...req.body,
        userId: req.user!.id
      });
      sendResponse(res, 200, attendance, 'Clocked out successfully');
    } catch (error) {
      next(error);
    }
  };

  getAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.attendanceService.getAttendance(req.query as any);
      sendResponse(res, 200, result, 'Attendance fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  updateAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const attendance = await this.attendanceService.updateAttendance(req.params.id, req.body);
      sendResponse(res, 200, attendance, 'Attendance updated successfully');
    } catch (error) {
      next(error);
    }
  };

  getAttendanceSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await this.attendanceService.getAttendanceSummary(req.query as any);
      sendResponse(res, 200, summary, 'Attendance summary fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getMonthlyAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { employeeId } = req.params;
      const { month, year } = req.query;
      
      const attendance = await this.attendanceService.getMonthlyAttendance(
        employeeId,
        parseInt(month as string),
        parseInt(year as string)
      );
      
      sendResponse(res, 200, attendance, 'Monthly attendance fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}