import Joi from 'joi';

export const recruitmentValidation = {
  createJob: Joi.object({
    title: Joi.string().required(),
    department: Joi.string().required(),
    location: Joi.string().required(),
    employmentType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN').required(),
    experienceLevel: Joi.string().valid('FRESHER', 'JUNIOR', 'MID', 'SENIOR', 'LEAD').required(),
    description: Joi.string().required(),
    requirements: Joi.array().items(Joi.string()).required(),
    responsibilities: Joi.array().items(Joi.string()).required(),
    skillsRequired: Joi.array().items(Joi.string()).required(),
    salaryRange: Joi.object({
      min: Joi.number().min(0).required(),
      max: Joi.number().min(Joi.ref('min')).required(),
      currency: Joi.string().optional()
    }).required(),
    benefits: Joi.array().items(Joi.string()).optional(),
    applicationDeadline: Joi.date().min('now').required()
  }),

  updateJob: Joi.object({
    title: Joi.string().optional(),
    department: Joi.string().optional(),
    location: Joi.string().optional(),
    employmentType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN').optional(),
    experienceLevel: Joi.string().valid('FRESHER', 'JUNIOR', 'MID', 'SENIOR', 'LEAD').optional(),
    description: Joi.string().optional(),
    requirements: Joi.array().items(Joi.string()).optional(),
    responsibilities: Joi.array().items(Joi.string()).optional(),
    skillsRequired: Joi.array().items(Joi.string()).optional(),
    salaryRange: Joi.object({
      min: Joi.number().min(0).optional(),
      max: Joi.number().min(Joi.ref('min')).optional(),
      currency: Joi.string().optional()
    }).optional(),
    benefits: Joi.array().items(Joi.string()).optional(),
    applicationDeadline: Joi.date().optional(),
    isActive: Joi.boolean().optional()
  }),

  apply: Joi.object({
    candidateName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    resume: Joi.string().uri().optional(),
    coverLetter: Joi.string().optional(),
    experience: Joi.number().min(0).optional(),
    currentSalary: Joi.number().min(0).optional(),
    expectedSalary: Joi.number().min(0).optional()
  }),

  params: Joi.object({
    id: Joi.string().required()
  }),

  applyParams: Joi.object({
    jobId: Joi.string().required()
  })
};