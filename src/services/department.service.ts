import { Department } from '@prisma/client';
import { DepartmentDAO, CreateDepartmentData, UpdateDepartmentData } from '../dao/department.dao';
import { ApiError } from '../utils/ApiError';
import { PaginationHelper } from '../utils/pagination';
import { logger } from '../utils/logger';

export class DepartmentService {
  private departmentDAO: DepartmentDAO;

  constructor() {
    this.departmentDAO = new DepartmentDAO();
  }

  async createDepartment(data: CreateDepartmentData): Promise<Department> {
    const existingDepartment = await this.departmentDAO.findByName(data.name);
    if (existingDepartment) {
      throw new ApiError(400, 'Department with this name already exists');
    }

    const department = await this.departmentDAO.create(data);
    logger.info(`Department created: ${department.name}`);
    return department;
  }

  async getDepartments(filters: {
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ departments: Department[]; total: number; pagination: any }> {
    const { page = 1, limit = 10 } = filters;
    const result = await this.departmentDAO.findMany(filters);

    return PaginationHelper.createPaginationResult(
      result.departments,
      result.total,
      page,
      limit
    );
  }

  async getDepartmentById(id: string): Promise<Department> {
    const department = await this.departmentDAO.findById(id);
    if (!department) {
      throw new ApiError(404, 'Department not found');
    }
    return department;
  }

  async updateDepartment(id: string, data: UpdateDepartmentData): Promise<Department> {
    const department = await this.departmentDAO.update(id, data);
    logger.info(`Department updated: ${id}`);
    return department;
  }

  async deleteDepartment(id: string): Promise<void> {
    await this.departmentDAO.delete(id);
    logger.info(`Department deleted: ${id}`);
  }
}