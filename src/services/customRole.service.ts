import { CustomRole } from '@prisma/client';
import { CustomRoleDAO, CreateCustomRoleData, UpdateCustomRoleData } from '../dao/customRole.dao';
import { ApiError } from '../utils/ApiError';
import { PaginationHelper } from '../utils/pagination';
import { logger } from '../utils/logger';

export class CustomRoleService {
  private customRoleDAO: CustomRoleDAO;

  constructor() {
    this.customRoleDAO = new CustomRoleDAO();
  }

  async createRole(data: CreateCustomRoleData): Promise<CustomRole> {
    const existingRole = await this.customRoleDAO.findByName(data.name);
    if (existingRole) {
      throw new ApiError(400, 'Role with this name already exists');
    }

    const role = await this.customRoleDAO.create(data);
    logger.info(`Custom role created: ${role.name}`);
    return role;
  }

  async getRoles(filters: {
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ roles: CustomRole[]; total: number; pagination: any }> {
    const { page = 1, limit = 10 } = filters;
    const result = await this.customRoleDAO.findMany(filters);

    return PaginationHelper.createPaginationResult(
      result.roles,
      result.total,
      page,
      limit
    );
  }

  async getRoleById(id: string): Promise<CustomRole> {
    const role = await this.customRoleDAO.findById(id);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }
    return role;
  }

  async updateRole(id: string, data: UpdateCustomRoleData): Promise<CustomRole> {
    const role = await this.customRoleDAO.update(id, data);
    logger.info(`Custom role updated: ${id}`);
    return role;
  }

  async deleteRole(id: string): Promise<void> {
    await this.customRoleDAO.delete(id);
    logger.info(`Custom role deleted: ${id}`);
  }

  getAvailablePermissions(): string[] {
    return [
      // User Management
      'user.create', 'user.read', 'user.update', 'user.delete',
      
      // Employee Management
      'employee.create', 'employee.read', 'employee.update', 'employee.delete',
      
      // Attendance Management
      'attendance.read', 'attendance.update', 'attendance.approve',
      
      // Leave Management
      'leave.apply', 'leave.read', 'leave.approve', 'leave.cancel',
      
      // Payroll Management
      'payroll.process', 'payroll.read', 'payroll.update',
      
      // Recruitment Management
      'recruitment.create', 'recruitment.read', 'recruitment.update',
      
      // Performance Management
      'performance.create', 'performance.read', 'performance.update',
      
      // Analytics & Reports
      'analytics.read', 'reports.generate',
      
      // System Administration
      'system.settings', 'roles.manage', 'audit.read',
      
      // Document Management
      'documents.upload', 'documents.read', 'documents.verify',
      
      // Organization Management
      'departments.manage', 'designations.manage'
    ];
  }
}