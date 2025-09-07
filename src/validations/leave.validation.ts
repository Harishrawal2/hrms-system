import Joi from 'joi';

export const leaveValidation = {
  apply: Joi.object({
    leaveType: Joi.string().valid('SICK', 'CASUAL', 'EARNED', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT', 'COMPENSATORY', 'UNPAID').required(),
    startDate: Joi.date().min('now').required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    reason: Joi.string().min(10).max(500).required(),
    isHalfDay: Joi.boolean().optional(),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required()
    }).optional(),
    documents: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        url: Joi.string().uri().required()
      })
    ).optional()
  }),

  approve: Joi.object({
    status: Joi.string().valid('APPROVED', 'REJECTED').required(),
    rejectionReason: Joi.string().when('status', {
      is: 'REJECTED',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }),

  getLeaves: Joi.object({
    employeeId: Joi.string().optional(),
    status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED').optional(),
    leaveType: Joi.string().valid('SICK', 'CASUAL', 'EARNED', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT', 'COMPENSATORY', 'UNPAID').optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().min(Joi.ref('startDate')).optional(),
    department: Joi.string().optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
    sort: Joi.string().optional()
  }),

  params: Joi.object({
    id: Joi.string().required()
  }),

  balanceParams: Joi.object({
    employeeId: Joi.string().required()
  })
};