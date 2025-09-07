import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

// Attendance reports
router.get('/attendance', authorize('admin', 'hr', 'manager'), (req, res) => {
  res.json({ message: 'Get attendance reports endpoint' });
});

// Leave reports
router.get('/leaves', authorize('admin', 'hr', 'manager'), (req, res) => {
  res.json({ message: 'Get leave reports endpoint' });
});

// Payroll reports
router.get('/payroll', authorize('admin', 'hr'), (req, res) => {
  res.json({ message: 'Get payroll reports endpoint' });
});

// Employee reports
router.get('/employees', authorize('admin', 'hr'), (req, res) => {
  res.json({ message: 'Get employee reports endpoint' });
});

export default router;