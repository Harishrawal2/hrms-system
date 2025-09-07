import Joi from 'joi';

export const notificationValidation = {
  params: Joi.object({
    id: Joi.string().required()
  })
};