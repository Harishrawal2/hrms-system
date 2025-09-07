import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employee.service';
import { sendResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError } from '../utils/ApiError';

export class EmployeeController {
  private employeeService: EmployeeService;

  constructor() {
    this.employeeService = new EmployeeService();
  }

  createEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employee = await this.employeeService.createEmployee(req.body);
      sendResponse(res, 201, employee, 'Employee created successfully');
    } catch (error) {
      next(error);
    }
  };

  getEmployees = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.employeeService.getEmployees(req.query as any);
      sendResponse(res, 200, result, 'Employees fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getEmployeeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employee = await this.employeeService.getEmployeeById(req.params.id);
      sendResponse(res, 200, employee, 'Employee fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employee = await this.employeeService.updateEmployee(req.params.id, req.body);
      sendResponse(res, 200, employee, 'Employee updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deactivateEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { terminationReason } = req.body;
      const employee = await this.employeeService.deactivateEmployee(req.params.id, terminationReason);
      sendResponse(res, 200, employee, 'Employee deactivated successfully');
    } catch (error) {
      next(error);
    }
  };

  getTeamMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const employee = await this.employeeService.getEmployeeByUserId(req.user!.id);
      if (!employee) {
        throw new ApiError(404, 'Employee profile not found');
      }
      const teamMembers = await this.employeeService.getTeamMembers(employee.employeeId);
      sendResponse(res, 200, teamMembers, 'Team members fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getDepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const departments = await this.employeeService.getDepartments();
      sendResponse(res, 200, departments, 'Departments fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getDesignations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const designations = await this.employeeService.getDesignations();
      sendResponse(res, 200, designations, 'Designations fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}