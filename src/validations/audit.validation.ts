import Joi from 'joi';

export const auditValidation = {
  getLogs: Joi.object({
    userId: Joi.string().optional(),
    action: Joi.string().optional(),
    resource: Joi.string().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().min(Joi.ref('startDate')).optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional()
  })
};