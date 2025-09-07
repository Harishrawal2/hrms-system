import { Request, Response, NextFunction } from 'express';
import { LeaveService } from '../services/leave.service';
import { sendResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export class LeaveController {
  private leaveService: LeaveService;

  constructor() {
    this.leaveService = new LeaveService();
  }

  applyLeave = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const leave = await this.leaveService.applyLeave(req.user!.id, req.body);
      sendResponse(res, 201, leave, 'Leave application submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  getLeaves = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.leaveService.getLeaves(req.query as any);
      sendResponse(res, 200, result, 'Leaves fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  approveLeave = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      
      const leave = await this.leaveService.approveLeave(id, req.user!.id, status, rejectionReason);
      sendResponse(res, 200, leave, `Leave application ${status.toLowerCase()} successfully`);
    } catch (error) {
      next(error);
    }
  };

  getLeaveBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { employeeId } = req.params;
      const { year } = req.query;
      
      const balance = await this.leaveService.getLeaveBalance(employeeId, year ? parseInt(year as string) : undefined);
      sendResponse(res, 200, balance, 'Leave balance fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  cancelLeave = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const leave = await this.leaveService.cancelLeave(id, req.user!.id);
      sendResponse(res, 200, leave, 'Leave application cancelled successfully');
    } catch (error) {
      next(error);
    }
  };
}