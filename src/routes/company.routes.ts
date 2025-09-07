import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

// Company settings
router.get('/settings', authorize('admin'), (req, res) => {
  res.json({ message: 'Get company settings endpoint' });
});

router.put('/settings', authorize('admin'), (req, res) => {
  res.json({ message: 'Update company settings endpoint' });
});

// Departments
router.post('/departments', authorize('admin', 'hr'), (req, res) => {
  res.json({ message: 'Create department endpoint' });
});

router.get('/departments', (req, res) => {
  res.json({ message: 'Get departments endpoint' });
});

// Designations
router.post('/designations', authorize('admin', 'hr'), (req, res) => {
  res.json({ message: 'Create designation endpoint' });
});

router.get('/designations', (req, res) => {
  res.json({ message: 'Get designations endpoint' });
});

export default router;