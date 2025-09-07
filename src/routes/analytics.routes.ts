import express from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateQuery } from '../middleware/validation.middleware';
import { analyticsValidation } from '../validations/analytics.validation';

const router = express.Router();
const analyticsController = new AnalyticsController();

router.use(authenticate);

// Dashboard analytics
router.get('/dashboard', 
  authorize('ADMIN', 'HR', 'MANAGER'),
  analyticsController.getDashboardStats
);

// Employee analytics
router.get('/employees', 
  authorize('ADMIN', 'HR'),
  validateQuery(analyticsValidation.employeeAnalytics),
  analyticsController.getEmployeeAnalytics
);

// Attendance analytics
router.get('/attendance', 
  authorize('ADMIN', 'HR', 'MANAGER'),
  validateQuery(analyticsValidation.attendanceAnalytics),
  analyticsController.getAttendanceAnalytics
);

// Leave analytics
router.get('/leaves', 
  authorize('ADMIN', 'HR', 'MANAGER'),
  validateQuery(analyticsValidation.leaveAnalytics),
  analyticsController.getLeaveAnalytics
);

// Payroll analytics
router.get('/payroll', 
  authorize('ADMIN', 'HR'),
  validateQuery(analyticsValidation.payrollAnalytics),
  analyticsController.getPayrollAnalytics
);

export default router;