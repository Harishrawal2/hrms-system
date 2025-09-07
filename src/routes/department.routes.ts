import express from 'express';
import { DepartmentController } from '../controllers/department.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, validateParams } from '../middleware/validation.middleware';
import { departmentValidation } from '../validations/department.validation';

const router = express.Router();
const departmentController = new DepartmentController();

router.use(authenticate);

router.post('/', 
  authorize('ADMIN', 'HR'), 
  validate(departmentValidation.create), 
  departmentController.createDepartment
);

router.get('/', departmentController.getDepartments);

router.get('/:id', 
  validateParams(departmentValidation.params), 
  departmentController.getDepartmentById
);

router.put('/:id', 
  authorize('ADMIN', 'HR'), 
  validateParams(departmentValidation.params),
  validate(departmentValidation.update), 
  departmentController.updateDepartment
);

router.delete('/:id', 
  authorize('ADMIN'), 
  validateParams(departmentValidation.params),
  departmentController.deleteDepartment
);

export default router;