import express from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, validateParams, validateQuery } from '../middleware/validation.middleware';
import { employeeValidation } from '../validations/employee.validation';

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management operations
 */

const router = express.Router();
const employeeController = new EmployeeController();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/employees:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personalInfo
 *               - professionalInfo
 *               - emergencyContact
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               personalInfo:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *                   gender:
 *                     type: string
 *                     enum: [MALE, FEMALE, OTHER]
 *                   phone:
 *                     type: string
 *               professionalInfo:
 *                 type: object
 *                 properties:
 *                   designation:
 *                     type: string
 *                   department:
 *                     type: string
 *                   joiningDate:
 *                     type: string
 *                     format: date
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 */
router.post('/', 
  authorize('ADMIN', 'HR'), 
  validate(employeeValidation.create), 
  employeeController.createEmployee
);

/**
 * @swagger
 * /api/v1/employees:
 *   get:
 *     summary: Get employees with pagination and filtering
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort fields (e.g., -createdAt,firstName)
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name and employee ID
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/', 
  authorize('ADMIN', 'HR', 'MANAGER'), 
  validateQuery(employeeValidation.getEmployees),
  employeeController.getEmployees
);

router.get('/departments', employeeController.getDepartments);
router.get('/designations', employeeController.getDesignations);

router.get('/team', 
  authorize('MANAGER'), 
  employeeController.getTeamMembers
);

/**
 * @swagger
 * /api/v1/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 */
router.get('/:id', 
  validateParams(employeeValidation.params), 
  employeeController.getEmployeeById
);

router.put('/:id', 
  authorize('ADMIN', 'HR'), 
  validateParams(employeeValidation.params),
  validate(employeeValidation.update), 
  employeeController.updateEmployee
);

router.patch('/:id/deactivate', 
  authorize('ADMIN', 'HR'), 
  validateParams(employeeValidation.params),
  employeeController.deactivateEmployee
);

export default router;