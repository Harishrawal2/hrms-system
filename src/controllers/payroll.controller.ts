import { Request, Response, NextFunction } from 'express';
import { PayrollService } from '../services/payroll.service';
import { sendResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError } from '../utils/ApiError';

export class PayrollController {
  private payrollService: PayrollService;

  constructor() {
    this.payrollService = new PayrollService();
  }

  processPayroll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const employee = await this.payrollService.getEmployeeByUserId(req.user!.id);
      if (!employee) {
        throw new ApiError(404, 'Employee profile not found');
      }
      const payroll = await this.payrollService.processPayroll(req.body, employee.employeeId);
      sendResponse(res, 201, payroll, 'Payroll processed successfully');
    } catch (error) {
      next(error);
    }
  };

  getPayrolls = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.payrollService.getPayrolls(req.query as any);
      sendResponse(res, 200, result, 'Payrolls fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  generatePayslip = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { payrollId } = req.params;
      const payslip = await this.payrollService.generatePayslip(payrollId);
      sendResponse(res, 200, payslip, 'Payslip generated successfully');
    } catch (error) {
      next(error);
    }
  };

  updatePayrollStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status, paymentDate, paymentMethod, paymentReference } = req.body;
      
      const payroll = await this.payrollService.updatePayrollStatus(id, status, {
        paymentDate,
        paymentMethod,
        paymentReference
      });
      
      sendResponse(res, 200, payroll, 'Payroll status updated successfully');
    } catch (error) {
      next(error);
    }
  };

  getPayrollSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await this.payrollService.getPayrollSummary(req.query as any);
      sendResponse(res, 200, summary, 'Payroll summary fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}