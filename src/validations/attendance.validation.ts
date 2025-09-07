import Joi from 'joi';

export const attendanceValidation = {
  clockIn: Joi.object({
    employeeId: Joi.string().optional(),
    location: Joi.object({
      type: Joi.string().valid('OFFICE', 'REMOTE', 'CLIENT_SITE').optional(),
      address: Joi.string().optional(),
      coordinates: Joi.object({
        latitude: Joi.number().optional(),
        longitude: Joi.number().optional()
      }).optional()
    }).optional(),
    notes: Joi.string().max(500).optional()
  }),

  clockOut: Joi.object({
    employeeId: Joi.string().optional(),
    breakDuration: Joi.number().min(0).max(480).optional(), // Max 8 hours break
    notes: Joi.string().max(500).optional()
  }),

  update: Joi.object({
    clockIn: Joi.date().optional(),
    clockOut: Joi.date().optional(),
    breakDuration: Joi.number().min(0).max(480).optional(),
    status: Joi.string().valid('PRESENT', 'ABSENT', 'HALF_DAY', 'WORK_FROM_HOME', 'ON_LEAVE').optional(),
    notes: Joi.string().max(500).optional(),
    approvedBy: Joi.string().optional()
  }),

  getAttendance: Joi.object({
    employeeId: Joi.string().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().min(Joi.ref('startDate')).optional(),
    status: Joi.string().valid('PRESENT', 'ABSENT', 'HALF_DAY', 'WORK_FROM_HOME', 'ON_LEAVE').optional(),
    department: Joi.string().optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
    sort: Joi.string().optional()
  }),

  getSummary: Joi.object({
    employeeId: Joi.string().optional(),
    month: Joi.number().min(1).max(12).optional(),
    year: Joi.number().min(2020).max(2030).optional(),
    department: Joi.string().optional()
  }),

  monthlyParams: Joi.object({
    employeeId: Joi.string().required()
  }),

  monthlyQuery: Joi.object({
    month: Joi.number().min(1).max(12).required(),
    year: Joi.number().min(2020).max(2030).required()
  }),

  params: Joi.object({
    id: Joi.string().required()
  })
};