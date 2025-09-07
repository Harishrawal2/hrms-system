import express from 'express';
import { LeaveController } from '../controllers/leave.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, validateParams, validateQuery } from '../middleware/validation.middleware';
import { leaveValidation } from '../validations/leave.validation';

/**
 * @swagger
 * tags:
 *   name: Leaves
 *   description: Leave management operations
 */

const router = express.Router();
const leaveController = new LeaveController();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/leaves:
 *   post:
 *     summary: Apply for leave
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leaveType
 *               - startDate
 *               - endDate
 *               - reason
 *             properties:
 *               leaveType:
 *                 type: string
 *                 enum: [SICK, CASUAL, EARNED, MATERNITY, PATERNITY, BEREAVEMENT]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               reason:
 *                 type: string
 *               isHalfDay:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Leave application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Leave'
 */
router.post('/', validate(leaveValidation.apply), leaveController.applyLeave);

/**
 * @swagger
 * /api/v1/leaves:
 *   get:
 *     summary: Get leave applications with filtering
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, CANCELLED]
 *         description: Filter by leave status
 *       - in: query
 *         name: leaveType
 *         schema:
 *           type: string
 *           enum: [SICK, CASUAL, EARNED, MATERNITY, PATERNITY]
 *         description: Filter by leave type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Leave applications retrieved successfully
 */
router.get('/', 
  validateQuery(leaveValidation.getLeaves),
  leaveController.getLeaves
);

/**
 * @swagger
 * /api/v1/leaves/{id}/approve:
 *   patch:
 *     summary: Approve or reject leave application
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Leave application processed successfully
 */
router.patch('/:id/approve', 
  authorize('ADMIN', 'HR', 'MANAGER'),
  validateParams(leaveValidation.params),
  validate(leaveValidation.approve),
  leaveController.approveLeave
);

router.patch('/:id/cancel', 
  validateParams(leaveValidation.params),
  leaveController.cancelLeave
);

/**
 * @swagger
 * /api/v1/leaves/{employeeId}/balance:
 *   get:
 *     summary: Get employee leave balance
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for leave balance
 *     responses:
 *       200:
 *         description: Leave balance retrieved successfully
 */
router.get('/:employeeId/balance', 
  validateParams(leaveValidation.balanceParams),
  leaveController.getLeaveBalance
);

export default router;