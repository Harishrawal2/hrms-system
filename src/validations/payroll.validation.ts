import Joi from 'joi';

export const payrollValidation = {
  process: Joi.object({
    employeeId: Joi.string().required(),
    payPeriod: Joi.object({
      month: Joi.number().min(1).max(12).required(),
      year: Joi.number().min(2020).max(2030).required()
    }).required(),
    basicSalary: Joi.number().min(0).required(),
    allowances: Joi.object({
      hra: Joi.number().min(0).optional(),
      transport: Joi.number().min(0).optional(),
      medical: Joi.number().min(0).optional(),
      special: Joi.number().min(0).optional(),
      other: Joi.number().min(0).optional()
    }).optional(),
    deductions: Joi.object({
      pf: Joi.number().min(0).optional(),
      esic: Joi.number().min(0).optional(),
      tds: Joi.number().min(0).optional(),
      professionalTax: Joi.number().min(0).optional(),
      loanDeduction: Joi.number().min(0).optional(),
      other: Joi.number().min(0).optional()
    }).optional(),
    overtime: Joi.object({
      hours: Joi.number().min(0).optional(),
      rate: Joi.number().min(0).optional()
    }).optional(),
    bonus: Joi.number().min(0).optional(),
    incentives: Joi.number().min(0).optional()
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('DRAFT', 'PROCESSED', 'PAID', 'ON_HOLD').required(),
    paymentDate: Joi.date().optional(),
    paymentMethod: Joi.string().valid('BANK_TRANSFER', 'CHEQUE', 'CASH').optional(),
    paymentReference: Joi.string().optional()
  }),

  getPayrolls: Joi.object({
    employeeId: Joi.string().optional(),
    month: Joi.number().min(1).max(12).optional(),
    year: Joi.number().min(2020).max(2030).optional(),
    status: Joi.string().valid('DRAFT', 'PROCESSED', 'PAID', 'ON_HOLD').optional(),
    department: Joi.string().optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
    sort: Joi.string().optional()
  }),

  params: Joi.object({
    id: Joi.string().required()
  }),

  payslipParams: Joi.object({
    payrollId: Joi.string().required()
  })
};