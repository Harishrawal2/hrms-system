import { Request, Response, NextFunction } from 'express';
import { CustomRoleService } from '../services/customRole.service';
import { sendResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export class CustomRoleController {
  private customRoleService: CustomRoleService;

  constructor() {
    this.customRoleService = new CustomRoleService();
  }

  createRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const role = await this.customRoleService.createRole({
        ...req.body,
        createdBy: req.user!.id
      });
      sendResponse(res, 201, role, 'Custom role created successfully');
    } catch (error) {
      next(error);
    }
  };

  getRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.customRoleService.getRoles(req.query as any);
      sendResponse(res, 200, result, 'Custom roles fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getRoleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = await this.customRoleService.getRoleById(req.params.id);
      sendResponse(res, 200, role, 'Custom role fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  updateRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = await this.customRoleService.updateRole(req.params.id, req.body);
      sendResponse(res, 200, role, 'Custom role updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.customRoleService.deleteRole(req.params.id);
      sendResponse(res, 200, null, 'Custom role deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  getPermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permissions = this.customRoleService.getAvailablePermissions();
      sendResponse(res, 200, permissions, 'Available permissions fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}