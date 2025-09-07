import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HRMS API Documentation',
      version: '1.0.0',
      description: 'Comprehensive Human Resource Management System API',
      contact: {
        name: 'HRMS Support',
        email: 'support@hrms.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server'
      },
      {
        url: 'https://api.hrms.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
            isActive: { type: 'boolean' },
            emailVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Employee: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            employeeId: { type: 'string' },
            personalInfo: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                dateOfBirth: { type: 'string', format: 'date' },
                gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
                phone: { type: 'string' }
              }
            },
            professionalInfo: {
              type: 'object',
              properties: {
                designation: { type: 'string' },
                department: { type: 'string' },
                joiningDate: { type: 'string', format: 'date' },
                employmentType: { type: 'string', enum: ['PERMANENT', 'CONTRACT', 'INTERN'] }
              }
            }
          }
        },
        Attendance: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            employeeId: { type: 'string' },
            date: { type: 'string', format: 'date' },
            clockIn: { type: 'string', format: 'date-time' },
            clockOut: { type: 'string', format: 'date-time' },
            totalHours: { type: 'number' },
            status: { type: 'string', enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'WORK_FROM_HOME'] }
          }
        },
        Leave: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            employeeId: { type: 'string' },
            leaveType: { type: 'string', enum: ['SICK', 'CASUAL', 'EARNED', 'MATERNITY', 'PATERNITY'] },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            totalDays: { type: 'number' },
            reason: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] }
          }
        },
        Payroll: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            employeeId: { type: 'string' },
            payPeriod: {
              type: 'object',
              properties: {
                month: { type: 'number' },
                year: { type: 'number' }
              }
            },
            basicSalary: { type: 'number' },
            grossSalary: { type: 'number' },
            netSalary: { type: 'number' },
            status: { type: 'string', enum: ['DRAFT', 'PROCESSED', 'PAID'] }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            statusCode: { type: 'number' },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            data: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                current: { type: 'number' },
                pages: { type: 'number' },
                total: { type: 'number' },
                limit: { type: 'number' },
                hasNext: { type: 'boolean' },
                hasPrev: { type: 'boolean' }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'number' },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'HRMS API Documentation'
  }));
};

export default specs;