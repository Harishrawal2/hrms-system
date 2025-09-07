import Joi from 'joi';

export const userValidation = {
  getUsers: Joi.object({
    role: Joi.string().valid('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE').optional(),
    isActive: Joi.boolean().optional(),
    emailVerified: Joi.boolean().optional(),
    search: Joi.string().optional(),
    department: Joi.string().optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
    sort: Joi.string().optional()
  }),

  update: Joi.object({
    email: Joi.string().email().optional(),
    role: Joi.string().valid('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE').optional(),
    isActive: Joi.boolean().optional()
  }),

  params: Joi.object({
    id: Joi.string().required()
  })
};