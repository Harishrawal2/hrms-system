import express from 'express';
import { PayrollController } from '../controllers/payroll.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, validateParams } from '../middleware/validation.middleware';
import { payrollValidation } from '../validations/payroll.validation';

/**
 * @swagger
 * tags:
 *   name: Payroll
 *   description: Payroll management operations
 */

const router = express.Router();
const payrollController = new PayrollController();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/payroll:
 *   post:
 *     summary: Process payroll for an employee
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - payPeriod
 *               - basicSalary
 *             properties:
 *               employeeId:
 *                 type: string
 *               payPeriod:
 *                 type: object
 *                 properties:
 *                   month:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 12
 *                   year:
 *                     type: integer
 *               basicSalary:
 *                 type: number
 *               allowances:
 *                 type: object
 *                 properties:
 *                   hra:
 *                     type: number
 *                   transport:
 *                     type: number
 *                   medical:
 *                     type: number
 *     responses:
 *       201:
 *         description: Payroll processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Payroll'
 */
router.post('/', 
  authorize('ADMIN', 'HR'),
  validate(payrollValidation.process),
  payrollController.processPayroll
);

/**
 * @swagger
 * /api/v1/payroll:
 *   get:
 *     summary: Get payroll records with filtering
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Filter by month
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PROCESSED, PAID]
 *         description: Filter by payroll status
 *     responses:
 *       200:
 *         description: Payroll records retrieved successfully
 */
router.get('/', 
  authorize('ADMIN', 'HR', 'MANAGER'),
  payrollController.getPayrolls
);

router.get('/summary', 
  authorize('ADMIN', 'HR'),
  payrollController.getPayrollSummary
);

/**
 * @swagger
 * /api/v1/payroll/{payrollId}/payslip:
 *   get:
 *     summary: Generate payslip for payroll record
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: payrollId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll record ID
 *     responses:
 *       200:
 *         description: Payslip generated successfully
 */
router.get('/:payrollId/payslip', 
  validateParams(payrollValidation.payslipParams),
  payrollController.generatePayslip
);

router.patch('/:id/status', 
  authorize('ADMIN', 'HR'),
  validateParams(payrollValidation.params),
  validate(payrollValidation.updateStatus),
  payrollController.updatePayrollStatus
);

export default router;