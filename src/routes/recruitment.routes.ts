import express from 'express';
import { RecruitmentController } from '../controllers/recruitment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, validateParams } from '../middleware/validation.middleware';
import { recruitmentValidation } from '../validations/recruitment.validation';

const router = express.Router();
const recruitmentController = new RecruitmentController();

router.use(authenticate);

// Job postings
router.post('/jobs', 
  authorize('ADMIN', 'HR'), 
  validate(recruitmentValidation.createJob),
  recruitmentController.createJobPosting
);

router.get('/jobs', recruitmentController.getJobPostings);
router.get('/jobs/active', recruitmentController.getActiveJobs);

router.get('/jobs/:id', 
  validateParams(recruitmentValidation.params),
  recruitmentController.getJobPostingById
);

router.put('/jobs/:id', 
  authorize('ADMIN', 'HR'),
  validateParams(recruitmentValidation.params),
  validate(recruitmentValidation.updateJob),
  recruitmentController.updateJobPosting
);

router.patch('/jobs/:id/deactivate', 
  authorize('ADMIN', 'HR'),
  validateParams(recruitmentValidation.params),
  recruitmentController.deactivateJobPosting
);

// Applications
router.post('/jobs/:jobId/apply', 
  validateParams(recruitmentValidation.applyParams),
  validate(recruitmentValidation.apply),
  recruitmentController.applyForJob
);

export default router;