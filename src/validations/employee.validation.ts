import Joi from 'joi';

export const employeeValidation = {
  create: Joi.object({
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    role: Joi.string().valid('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE').optional(),
    personalInfo: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      dateOfBirth: Joi.date().required(),
      gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(),
      maritalStatus: Joi.string().valid('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED').optional(),
      nationality: Joi.string().optional(),
      phone: Joi.string().required(),
      alternatePhone: Joi.string().optional(),
      address: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        postalCode: Joi.string().required(),
        country: Joi.string().optional()
      }).required()
    }).required(),
    professionalInfo: Joi.object({
      designation: Joi.string().required(),
      department: Joi.string().required(),
      joiningDate: Joi.date().required(),
      employmentType: Joi.string().valid('PERMANENT', 'CONTRACT', 'INTERN', 'CONSULTANT').optional(),
      workLocation: Joi.string().valid('OFFICE', 'REMOTE', 'HYBRID').optional(),
      probationPeriod: Joi.number().min(0).optional(),
      noticePeriod: Joi.number().min(0).optional()
    }).required(),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      relation: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().email().optional()
    }).required(),
    bankDetails: Joi.object({
      accountNumber: Joi.string().optional(),
      bankName: Joi.string().optional(),
      branchName: Joi.string().optional(),
      ifscCode: Joi.string().optional(),
      accountHolderName: Joi.string().optional()
    }).optional()
  }),

  update: Joi.object({
    personalInfo: Joi.object({
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      phone: Joi.string().optional(),
      alternatePhone: Joi.string().optional(),
      address: Joi.object({
        street: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        postalCode: Joi.string().optional(),
        country: Joi.string().optional()
      }).optional()
    }).optional(),
    professionalInfo: Joi.object({
      designation: Joi.string().optional(),
      department: Joi.string().optional(),
      workLocation: Joi.string().valid('OFFICE', 'REMOTE', 'HYBRID').optional()
    }).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().optional(),
      relation: Joi.string().optional(),
      phone: Joi.string().optional(),
      email: Joi.string().email().optional()
    }).optional(),
    bankDetails: Joi.object({
      accountNumber: Joi.string().optional(),
      bankName: Joi.string().optional(),
      branchName: Joi.string().optional(),
      ifscCode: Joi.string().optional(),
      accountHolderName: Joi.string().optional()
    }).optional()
  }),

  getEmployees: Joi.object({
    department: Joi.string().optional(),
    designation: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    search: Joi.string().optional(),
    employmentType: Joi.string().valid('PERMANENT', 'CONTRACT', 'INTERN', 'CONSULTANT').optional(),
    workLocation: Joi.string().valid('OFFICE', 'REMOTE', 'HYBRID').optional(),
    joiningDateFrom: Joi.date().optional(),
    joiningDateTo: Joi.date().min(Joi.ref('joiningDateFrom')).optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
    sort: Joi.string().optional()
  }),

  params: Joi.object({
    id: Joi.string().required()
  })
};