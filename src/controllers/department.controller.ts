import { Request, Response, NextFunction } from 'express';
import { DepartmentService } from '../services/department.service';
import { sendResponse } from '../utils/ApiResponse';

export class DepartmentController {
  private departmentService: DepartmentService;

  constructor() {
    this.departmentService = new DepartmentService();
  }

  createDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const department = await this.departmentService.createDepartment(req.body);
      sendResponse(res, 201, department, 'Department created successfully');
    } catch (error) {
      next(error);
    }
  };

  getDepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.departmentService.getDepartments(req.query as any);
      sendResponse(res, 200, result, 'Departments fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getDepartmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const department = await this.departmentService.getDepartmentById(req.params.id);
      sendResponse(res, 200, department, 'Department fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const department = await this.departmentService.updateDepartment(req.params.id, req.body);
      sendResponse(res, 200, department, 'Department updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.departmentService.deleteDepartment(req.params.id);
      sendResponse(res, 200, null, 'Department deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}