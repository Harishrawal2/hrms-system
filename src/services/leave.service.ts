import { Leave, LeaveStatus, LeaveType } from '@prisma/client';
import { LeaveDAO, CreateLeaveData, UpdateLeaveData } from '../dao/leave.dao';
import { EmployeeDAO } from '../dao/employee.dao';
import { emailService } from '../config/email';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export class LeaveService {
  private leaveDAO: LeaveDAO;
  private employeeDAO: EmployeeDAO;

  constructor() {
    this.leaveDAO = new LeaveDAO();
    this.employeeDAO = new EmployeeDAO();
  }

  async applyLeave(userId: string, data: Omit<CreateLeaveData, 'employeeId'>): Promise<Leave> {
    const employee = await this.employeeDAO.findByUserId(userId);
    if (!employee) {
      throw new ApiError(404, 'Employee profile not found');
    }

    // Check for overlapping leaves
    const overlappingLeave = await this.leaveDAO.checkOverlappingLeaves(
      employee.employeeId,
      data.startDate,
      data.endDate
    );

    if (overlappingLeave) {
      throw new ApiError(400, 'Leave application overlaps with existing leave');
    }

    const leave = await this.leaveDAO.create({
      ...data,
      employeeId: employee.employeeId
    });

    // Send email notification
    try {
      await emailService.sendLeaveNotification(
        employee.user.email,
        `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
        leave,
        'applied'
      );
    } catch (error) {
      logger.error('Failed to send leave notification email:', error);
    }

    logger.info(`Leave applied: ${leave.id} by employee ${employee.employeeId}`);
    return leave;
  }

  async getLeaves(filters: {
    employeeId?: string;
    status?: LeaveStatus;
    leaveType?: LeaveType;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ leaves: Leave[]; total: number; pagination: any }> {
    const { page = 1, limit = 10 } = filters;
    const result = await this.leaveDAO.findMany(filters);

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

  async approveLeave(
    leaveId: string,
    approverId: string,
    status: LeaveStatus,
    rejectionReason?: string
  ): Promise<Leave> {
    const leave = await this.leaveDAO.findById(leaveId);
    if (!leave) {
      throw new ApiError(404, 'Leave application not found');
    }

    if (leave.status !== 'PENDING') {
      throw new ApiError(400, 'Leave application has already been processed');
    }

    const approver = await this.employeeDAO.findByUserId(approverId);
    if (!approver) {
      throw new ApiError(404, 'Approver profile not found');
    }

    const updateData: UpdateLeaveData = {
      status,
      approvedBy: approver.employeeId,
      approvedDate: new Date()
    };

    if (status === 'REJECTED' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const updatedLeave = await this.leaveDAO.update(leaveId, updateData);
    
    // Send email notification
    try {
      const employee = updatedLeave.employee;
      await emailService.sendLeaveNotification(
        employee.user?.email || '',
        `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
        updatedLeave,
        status === 'APPROVED' ? 'approved' : 'rejected'
      );
    } catch (error) {
      logger.error('Failed to send leave approval notification email:', error);
    }
    
    logger.info(`Leave ${status}: ${leaveId} by ${approver.employeeId}`);
    
    return updatedLeave;
  }

  async getLeaveBalance(employeeId: string, year?: number): Promise<any> {
    return this.leaveDAO.getLeaveBalance(employeeId, year);
  }

  async cancelLeave(leaveId: string, userId: string): Promise<Leave> {
    const leave = await this.leaveDAO.findById(leaveId);
    if (!leave) {
      throw new ApiError(404, 'Leave application not found');
    }

    const employee = await this.employeeDAO.findByUserId(userId);
    if (!employee || employee.employeeId !== leave.employeeId) {
      throw new ApiError(403, 'Not authorized to cancel this leave');
    }

    if (leave.status !== 'PENDING') {
      throw new ApiError(400, 'Can only cancel pending leave applications');
    }

    const updatedLeave = await this.leaveDAO.update(leaveId, {
      status: 'CANCELLED'
    });

    logger.info(`Leave cancelled: ${leaveId} by ${employee.employeeId}`);
    return updatedLeave;
  }
}