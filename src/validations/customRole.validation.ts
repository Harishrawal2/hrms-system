import Joi from 'joi';

export const customRoleValidation = {
  create: Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().max(200).optional(),
    permissions: Joi.array().items(Joi.string()).min(1).required()
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(50).optional(),
    description: Joi.string().max(200).optional(),
    permissions: Joi.array().items(Joi.string()).optional(),
    isActive: Joi.boolean().optional()
  }),

  params: Joi.object({
    id: Joi.string().required()
  })
};