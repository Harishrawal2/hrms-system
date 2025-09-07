import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendResponse } from '../utils/ApiResponse';
import { PaginationHelper } from '../utils/pagination';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pagination = PaginationHelper.parsePagination(req.query);
      const result = await this.userService.getUsers({
        ...req.query,
        ...pagination
      } as any);
      
      sendResponse(res, 200, result, 'Users fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getUserStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.userService.getUserStats();
      sendResponse(res, 200, stats, 'User statistics fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      sendResponse(res, 200, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.userService.deleteUser(req.params.id);
      sendResponse(res, 200, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}