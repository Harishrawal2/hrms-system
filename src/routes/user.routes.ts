import express from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateQuery, validate, validateParams } from '../middleware/validation.middleware';
import { userValidation } from '../validations/user.validation';

const router = express.Router();
const userController = new UserController();

router.use(authenticate);

router.get('/', 
  authorize('ADMIN', 'HR'),
  validateQuery(userValidation.getUsers),
  userController.getUsers
);

router.get('/stats', 
  authorize('ADMIN', 'HR'),
  userController.getUserStats
);

router.put('/:id', 
  authorize('ADMIN'),
  validateParams(userValidation.params),
  validate(userValidation.update),
  userController.updateUser
);

router.delete('/:id', 
  authorize('ADMIN'),
  validateParams(userValidation.params),
  userController.deleteUser
);

export default router;