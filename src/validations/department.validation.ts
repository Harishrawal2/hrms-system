import Joi from 'joi';

export const departmentValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    headId: Joi.string().optional()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional(),
    headId: Joi.string().optional(),
    isActive: Joi.boolean().optional()
  }),

  params: Joi.object({
    id: Joi.string().required()
  })
};