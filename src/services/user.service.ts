import { User, Role } from '@prisma/client';
import { UserDAO, UpdateUserData } from '../dao/user.dao';
import { ApiError } from '../utils/ApiError';
import { PaginationHelper, PaginationResult } from '../utils/pagination';
import { logger } from '../utils/logger';

export class UserService {
  private userDAO: UserDAO;

  constructor() {
    this.userDAO = new UserDAO();
  }

  async getUsers(filters: {
    role?: Role;
    isActive?: boolean;
    emailVerified?: boolean;
    search?: string;
    department?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<PaginationResult<User>> {
    const { page = 1, limit = 10 } = filters;
    const result = await this.userDAO.findMany(filters);

    return PaginationHelper.createPaginationResult(
      result.users,
      result.total,
      page,
      limit
    );
  }

  async getUserStats(): Promise<any> {
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      adminUsers,
      hrUsers,
      managerUsers,
      employeeUsers
    ] = await Promise.all([
      this.userDAO.findMany({ page: 1, limit: 1 }).then(r => r.total),
      this.userDAO.findMany({ isActive: true, page: 1, limit: 1 }).then(r => r.total),
      this.userDAO.findMany({ emailVerified: true, page: 1, limit: 1 }).then(r => r.total),
      this.userDAO.findMany({ role: 'ADMIN', page: 1, limit: 1 }).then(r => r.total),
      this.userDAO.findMany({ role: 'HR', page: 1, limit: 1 }).then(r => r.total),
      this.userDAO.findMany({ role: 'MANAGER', page: 1, limit: 1 }).then(r => r.total),
      this.userDAO.findMany({ role: 'EMPLOYEE', page: 1, limit: 1 }).then(r => r.total)
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      verified: verifiedUsers,
      byRole: {
        admin: adminUsers,
        hr: hrUsers,
        manager: managerUsers,
        employee: employeeUsers
      },
      verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0
    };
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const user = await this.userDAO.update(id, data);
    logger.info(`User updated: ${id}`);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await this.userDAO.delete(id);
    logger.info(`User deleted: ${id}`);
  }
}