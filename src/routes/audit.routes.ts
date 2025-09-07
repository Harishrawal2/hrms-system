import express from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateQuery } from '../middleware/validation.middleware';
import { auditValidation } from '../validations/audit.validation';

const router = express.Router();
const auditController = new AuditController();

router.use(authenticate);
router.use(authorize('ADMIN')); // Only admins can view audit logs

router.get('/logs', validateQuery(auditValidation.getLogs), auditController.getAuditLogs);

export default router;