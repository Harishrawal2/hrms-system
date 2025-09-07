import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import PrismaService from './config/prisma';
import { connectRedis } from './config/redis';
import { setupSwagger } from './config/swagger';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import employeeRoutes from './routes/employee.routes';
import attendanceRoutes from './routes/attendance.routes';
import leaveRoutes from './routes/leave.routes';
import payrollRoutes from './routes/payroll.routes';
import recruitmentRoutes from './routes/recruitment.routes';
import performanceRoutes from './routes/performance.routes';
import analyticsRoutes from './routes/analytics.routes';
import customRoleRoutes from './routes/customRole.routes';
import departmentRoutes from './routes/department.routes';
import documentRoutes from './routes/document.routes';
import notificationRoutes from './routes/notification.routes';
import auditRoutes from './routes/audit.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Setup Swagger documentation
setupSwagger(app);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'HRMS API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
    documentation: '/api-docs'
  });
});

// API Routes
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/users`, userRoutes);
app.use(`/api/${apiVersion}/employees`, employeeRoutes);
app.use(`/api/${apiVersion}/attendance`, attendanceRoutes);
app.use(`/api/${apiVersion}/leaves`, leaveRoutes);
app.use(`/api/${apiVersion}/payroll`, payrollRoutes);
app.use(`/api/${apiVersion}/recruitment`, recruitmentRoutes);
app.use(`/api/${apiVersion}/performance`, performanceRoutes);
app.use(`/api/${apiVersion}/analytics`, analyticsRoutes);
app.use(`/api/${apiVersion}/roles`, customRoleRoutes);
app.use(`/api/${apiVersion}/departments`, departmentRoutes);
app.use(`/api/${apiVersion}/documents`, documentRoutes);
app.use(`/api/${apiVersion}/notifications`, notificationRoutes);
app.use(`/api/${apiVersion}/audit`, auditRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database connections and server start
const startServer = async () => {
  try {
    await PrismaService.connect();
    await connectRedis();
    
    app.listen(PORT, () => {
      logger.info(`🚀 HRMS Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🔍 Prisma Studio: Run 'npm run db:studio' to open database browser`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  await PrismaService.disconnect();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();