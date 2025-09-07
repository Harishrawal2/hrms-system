import Joi from 'joi';

export const performanceValidation = {
  create: Joi.object({
    employeeId: Joi.string().required(),
    reviewPeriod: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().min(Joi.ref('startDate')).required()
    }).required(),
    goals: Joi.array().items(
      Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        targetDate: Joi.date().required(),
        priority: Joi.string().valid('HIGH', 'MEDIUM', 'LOW').optional(),
        status: Joi.string().valid('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE').optional(),
        progress: Joi.number().min(0).max(100).optional(),
        comments: Joi.string().optional()
      })
    ).optional(),
    ratings: Joi.object({
      technical: Joi.number().min(1).max(5).required(),
      communication: Joi.number().min(1).max(5).required(),
      teamwork: Joi.number().min(1).max(5).required(),
      leadership: Joi.number().min(1).max(5).required(),
      punctuality: Joi.number().min(1).max(5).required()
    }).required(),
    feedback: Joi.object({
      selfAssessment: Joi.string().optional(),
      managerFeedback: Joi.string().optional(),
      peerFeedback: Joi.array().items(Joi.string()).optional(),
      improvementAreas: Joi.array().items(Joi.string()).optional(),
      strengths: Joi.array().items(Joi.string()).optional()
    }).optional(),
    nextReviewDate: Joi.date().min('now').required()
  }),

  update: Joi.object({
    goals: Joi.array().items(
      Joi.object({
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        targetDate: Joi.date().optional(),
        priority: Joi.string().valid('HIGH', 'MEDIUM', 'LOW').optional(),
        status: Joi.string().valid('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE').optional(),
        progress: Joi.number().min(0).max(100).optional(),
        comments: Joi.string().optional()
      })
    ).optional(),
    ratings: Joi.object({
      technical: Joi.number().min(1).max(5).optional(),
      communication: Joi.number().min(1).max(5).optional(),
      teamwork: Joi.number().min(1).max(5).optional(),
      leadership: Joi.number().min(1).max(5).optional(),
      punctuality: Joi.number().min(1).max(5).optional()
    }).optional(),
    feedback: Joi.object({
      selfAssessment: Joi.string().optional(),
      managerFeedback: Joi.string().optional(),
      peerFeedback: Joi.array().items(Joi.string()).optional(),
      improvementAreas: Joi.array().items(Joi.string()).optional(),
      strengths: Joi.array().items(Joi.string()).optional()
    }).optional(),
    status: Joi.string().valid('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'COMPLETED').optional(),
    nextReviewDate: Joi.date().optional()
  }),

  params: Joi.object({
    id: Joi.string().required()
  })
};