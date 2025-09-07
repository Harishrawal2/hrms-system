import Joi from 'joi';

export const documentValidation = {
  upload: Joi.object({
    employeeId: Joi.string().required(),
    type: Joi.string().valid('ID_PROOF', 'ADDRESS_PROOF', 'EDUCATION', 'EXPERIENCE', 'OFFER_LETTER', 'CONTRACT', 'MEDICAL', 'OTHER').required(),
    name: Joi.string().min(3).max(100).required()
  }),

  params: Joi.object({
    id: Joi.string().required()
  }),

  employeeParams: Joi.object({
    employeeId: Joi.string().required()
  })
};