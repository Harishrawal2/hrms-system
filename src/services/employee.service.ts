import { Employee, User, Role } from '@prisma/client';
import { EmployeeDAO, CreateEmployeeData, UpdateEmployeeData } from '../dao/employee.dao';
import { UserDAO } from '../dao/user.dao';
import { emailService } from '../config/email';
import { ApiError } from '../utils/ApiError';
import { PaginationHelper } from '../utils/pagination';
import { logger } from '../utils/logger';

export interface CreateEmployeeRequest extends Omit<CreateEmployeeData, 'employeeId' | 'userId'> {
  email?: string;
  password?: string;
  role?: Role;
}

export class EmployeeService {
  private employeeDAO: EmployeeDAO;
  private userDAO: UserDAO;

  constructor() {
    this.employeeDAO = new EmployeeDAO();
    this.userDAO = new UserDAO();
  }

  async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    // Generate unique employee ID
    const employeeId = `EMP${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    let userId = data.userId;
    
    // Create user account if email is provided
    if (!userId && data.email) {
      const user = await this.userDAO.create({
        email: data.email,
        password: data.password || 'temp123456',
        role: data.role || 'EMPLOYEE',
        employeeId
      });
      userId = user.id;
    }

    if (!userId) {
      throw new ApiError(400, 'User ID or email is required');
    }

    const employee = await this.employeeDAO.create({
      ...data,
      employeeId,
      userId
    });

    // Update user with employeeId reference
    await this.userDAO.update(userId, { employeeId });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(
        data.email!,
        `${data.personalInfo.firstName} ${data.personalInfo.lastName}`,
        data.password
      );
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
    }

    logger.info(`Employee created: ${employee.employeeId}`);
    return employee;
  }

  async getEmployees(filters: {
    department?: string;
    designation?: string;
    isActive?: boolean;
    search?: string;
    employmentType?: string;
    workLocation?: string;
    joiningDateFrom?: Date;
    joiningDateTo?: Date;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ employees: Employee[]; total: number; pagination: any }> {
    const { page = 1, limit = 10 } = filters;
    const result = await this.employeeDAO.findMany(filters);

    return PaginationHelper.createPaginationResult(
      result.employees,
      result.total,
      page,
      limit
    );
  }

  async getEmployeeById(employeeId: string): Promise<Employee> {
    const employee = await this.employeeDAO.findByEmployeeId(employeeId);
    if (!employee) {
      throw new ApiError(404, 'Employee not found');
    }
    return employee;
  }

  async updateEmployee(employeeId: string, data: UpdateEmployeeData): Promise<Employee> {
    const employee = await this.employeeDAO.update(employeeId, data);
    logger.info(`Employee updated: ${employeeId}`);
    return employee;
  }

  async deactivateEmployee(employeeId: string, terminationReason?: string): Promise<Employee> {
    const employee = await this.employeeDAO.update(employeeId, {
      isActive: false,
      terminationDate: new Date(),
      terminationReason
    });

    // Deactivate user account
    if (employee.userId) {
      await this.userDAO.update(employee.userId, { isActive: false });
    }

    logger.info(`Employee deactivated: ${employeeId}`);
    return employee;
  }

  async getTeamMembers(managerId: string): Promise<Employee[]> {
    const manager = await this.employeeDAO.findByEmployeeId(managerId);
    if (!manager) {
      throw new ApiError(404, 'Manager not found');
    }

    return this.employeeDAO.getTeamMembers(manager.id);
  }

  async getDepartments(): Promise<string[]> {
    return this.employeeDAO.getDepartments();
  }

  async getDesignations(): Promise<string[]> {
    return this.employeeDAO.getDesignations();
  }

  async getEmployeeByUserId(userId: string): Promise<Employee | null> {
    return this.employeeDAO.findByUserId(userId);
  }
}