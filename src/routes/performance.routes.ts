import express from 'express';
import { PerformanceController } from '../controllers/performance.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, validateParams } from '../middleware/validation.middleware';
import { performanceValidation } from '../validations/performance.validation';

const router = express.Router();
const performanceController = new PerformanceController();

router.use(authenticate);

// Performance reviews
router.post('/reviews', 
  authorize('ADMIN', 'HR', 'MANAGER'), 
  validate(performanceValidation.create),
  performanceController.createPerformanceReview
);

router.get('/reviews', performanceController.getPerformanceReviews);
router.get('/reviews/summary', authorize('ADMIN', 'HR'), performanceController.getPerformanceSummary);

router.get('/reviews/:id', 
  validateParams(performanceValidation.params),
  performanceController.getPerformanceById
);

router.put('/reviews/:id', 
  authorize('ADMIN', 'HR', 'MANAGER'),
  validateParams(performanceValidation.params),
  validate(performanceValidation.update),
  performanceController.updatePerformanceReview
);

router.patch('/reviews/:id/submit', 
  validateParams(performanceValidation.params),
  performanceController.submitPerformanceReview
);

export default router;