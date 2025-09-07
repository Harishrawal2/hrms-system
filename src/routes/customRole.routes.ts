import express from 'express';
import { CustomRoleController } from '../controllers/customRole.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, validateParams } from '../middleware/validation.middleware';
import { customRoleValidation } from '../validations/customRole.validation';

const router = express.Router();
const customRoleController = new CustomRoleController();

router.use(authenticate);
router.use(authorize('ADMIN')); // Only admins can manage custom roles

router.post('/', validate(customRoleValidation.create), customRoleController.createRole);
router.get('/', customRoleController.getRoles);
router.get('/permissions', customRoleController.getPermissions);
router.get('/:id', validateParams(customRoleValidation.params), customRoleController.getRoleById);
router.put('/:id', validateParams(customRoleValidation.params), validate(customRoleValidation.update), customRoleController.updateRole);
router.delete('/:id', validateParams(customRoleValidation.params), customRoleController.deleteRole);

export default router;