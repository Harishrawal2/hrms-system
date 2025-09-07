import { Payroll, PayrollStatus } from '@prisma/client';
import { PayrollDAO, CreatePayrollData, UpdatePayrollData } from '../dao/payroll.dao';
import { EmployeeDAO } from '../dao/employee.dao';
import { AttendanceDAO } from '../dao/attendance.dao';
import { LeaveDAO } from '../dao/leave.dao';
import { emailService } from '../config/email';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export interface ProcessPayrollRequest extends Omit<CreatePayrollData, 'workingDays' | 'actualWorkingDays' | 'leaveDays'> {
  // These will be calculated automatically
}

export class PayrollService {
  private payrollDAO: PayrollDAO;
  private employeeDAO: EmployeeDAO;
  private attendanceDAO: AttendanceDAO;
  private leaveDAO: LeaveDAO;

  constructor() {
    this.payrollDAO = new PayrollDAO();
    this.employeeDAO = new EmployeeDAO();
    this.attendanceDAO = new AttendanceDAO();
    this.leaveDAO = new LeaveDAO();
  }

  async getEmployeeByUserId(userId: string): Promise<any> {
    return this.employeeDAO.findByUserId(userId);
  }

  async processPayroll(data: ProcessPayrollRequest, processedBy: string): Promise<Payroll> {
    const { employeeId, payPeriod } = data;

    // Verify employee exists
    const employee = await this.employeeDAO.findByEmployeeId(employeeId);
    if (!employee) {
      throw new ApiError(404, 'Employee not found');
    }

    // Check if payroll already exists
    const existingPayroll = await this.payrollDAO.findByEmployeeAndPeriod(
      employeeId,
      payPeriod.month,
      payPeriod.year
    );

    if (existingPayroll) {
      throw new ApiError(400, 'Payroll already processed for this month');
    }

    // Calculate working days and attendance
    const startDate = new Date(payPeriod.year, payPeriod.month - 1, 1);
    const endDate = new Date(payPeriod.year, payPeriod.month, 0);
    const workingDays = endDate.getDate();

    const attendanceRecords = await this.attendanceDAO.getMonthlyAttendance(
      employeeId,
      payPeriod.month,
      payPeriod.year
    );

    const actualWorkingDays = attendanceRecords.filter(
      record => ['PRESENT', 'WORK_FROM_HOME'].includes(record.status)
    ).length;

    const overtimeHours = attendanceRecords.reduce((total, record) => total + record.overtimeHours, 0);

    // Get approved leaves
    const approvedLeaves = await this.leaveDAO.findMany({
      employeeId,
      status: 'APPROVED',
      startDate: startDate,
      endDate: endDate,
      page: 1,
      limit: 1000
    });
    
    const leaveDays = approvedLeaves.leaves.reduce((total, leave) => total + leave.totalDays, 0);

    // Calculate overtime amount
    const overtimeAmount = overtimeHours * (data.overtime?.rate || 0);

    const payroll = await this.payrollDAO.create({
      ...data,
      workingDays,
      actualWorkingDays,
      leaveDays,
      overtime: {
        hours: overtimeHours,
        rate: data.overtime?.rate || 0,
        amount: overtimeAmount
      },
      processedBy
    });

    // Send email notification
    try {
      await emailService.sendPayrollNotification(
        employee.user?.email || '',
        `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
        payroll
      );
    } catch (error) {
      logger.error('Failed to send payroll notification email:', error);
    }

    logger.info(`Payroll processed: ${payroll.id} for employee ${employeeId}`);
    return payroll;
  }

  async getPayrolls(filters: {
    employeeId?: string;
    month?: number;
    year?: number;
    status?: PayrollStatus;
    page?: number;
    limit?: number;
  }): Promise<{ payrolls: Payroll[]; total: number; pagination: any }> {
    const { page = 1, limit = 10 } = filters;
    const result = await this.payrollDAO.findMany(filters);

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

  async generatePayslip(payrollId: string): Promise<any> {
    const payroll = await this.payrollDAO.findById(payrollId);
    if (!payroll) {
      throw new ApiError(404, 'Payroll record not found');
    }

    // Generate payslip data (in real implementation, this would generate PDF)
    const payslipData = {
      payroll,
      generatedAt: new Date(),
      companyInfo: {
        name: process.env.COMPANY_NAME || 'Your Company',
        email: process.env.COMPANY_EMAIL || 'hr@company.com',
        website: process.env.COMPANY_WEBSITE || 'https://company.com'
      }
    };

    return payslipData;
  }

  async updatePayrollStatus(
    payrollId: string,
    status: PayrollStatus,
    paymentDetails?: {
      paymentDate?: Date;
      paymentMethod?: string;
      paymentReference?: string;
    }
  ): Promise<Payroll> {
    const updateData: UpdatePayrollData = { status };

    if (status === 'PAID' && paymentDetails) {
      updateData.paymentDate = paymentDetails.paymentDate || new Date();
      updateData.paymentMethod = paymentDetails.paymentMethod;
      updateData.paymentReference = paymentDetails.paymentReference;
    }

    const payroll = await this.payrollDAO.update(payrollId, updateData);
    logger.info(`Payroll status updated: ${payrollId} to ${status}`);
    
    return payroll;
  }

  async getPayrollSummary(filters: {
    month?: number;
    year?: number;
    department?: string;
  }): Promise<any> {
    return this.payrollDAO.getPayrollSummary(filters);
  }
}