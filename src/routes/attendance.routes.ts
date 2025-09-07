import express from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, validateParams, validateQuery } from '../middleware/validation.middleware';
import { attendanceValidation } from '../validations/attendance.validation';

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Employee attendance management
 */

const router = express.Router();
const attendanceController = new AttendanceController();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/attendance/clock-in:
 *   post:
 *     summary: Clock in for attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [OFFICE, REMOTE, CLIENT_SITE]
 *                   address:
 *                     type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Clocked in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Attendance'
 */
router.post('/clock-in', validate(attendanceValidation.clockIn), attendanceController.clockIn);

/**
 * @swagger
 * /api/v1/attendance/clock-out:
 *   post:
 *     summary: Clock out for attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               breakDuration:
 *                 type: number
 *                 description: Break duration in minutes
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Clocked out successfully
 */
router.post('/clock-out', validate(attendanceValidation.clockOut), attendanceController.clockOut);

/**
 * @swagger
 * /api/v1/attendance:
 *   get:
 *     summary: Get attendance records with filtering
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 */
router.get('/', 
  authorize('ADMIN', 'HR', 'MANAGER'),
  validateQuery(attendanceValidation.getAttendance),
  attendanceController.getAttendance
);

router.get('/summary', 
  authorize('ADMIN', 'HR', 'MANAGER'),
  validateQuery(attendanceValidation.getSummary),
  attendanceController.getAttendanceSummary
);

router.get('/:employeeId/monthly', 
  authorize('ADMIN', 'HR', 'MANAGER'),
  validateParams(attendanceValidation.monthlyParams),
  validateQuery(attendanceValidation.monthlyQuery),
  attendanceController.getMonthlyAttendance
);

router.put('/:id', 
  authorize('ADMIN', 'HR'),
  validateParams(attendanceValidation.params),
  validate(attendanceValidation.update),
  attendanceController.updateAttendance
);

export default router;