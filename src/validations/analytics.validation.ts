import Joi from 'joi';

export const analyticsValidation = {
  employeeAnalytics: Joi.object({
    department: Joi.string().optional(),
    year: Joi.number().min(2020).max(2030).optional()
  }),

  attendanceAnalytics: Joi.object({
    month: Joi.number().min(1).max(12).optional(),
    year: Joi.number().min(2020).max(2030).optional(),
    department: Joi.string().optional(),
    employeeId: Joi.string().optional()
  }),

  leaveAnalytics: Joi.object({
    month: Joi.number().min(1).max(12).optional(),
    year: Joi.number().min(2020).max(2030).optional(),
    department: Joi.string().optional(),
    leaveType: Joi.string().valid('SICK', 'CASUAL', 'EARNED', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT', 'COMPENSATORY', 'UNPAID').optional()
  }),

  payrollAnalytics: Joi.object({
    month: Joi.number().min(1).max(12).optional(),
    year: Joi.number().min(2020).max(2030).optional(),
    department: Joi.string().optional()
  })
};