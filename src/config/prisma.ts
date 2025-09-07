import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

class PrismaService {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        log: [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'info', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ],
      });

      // Log queries in development
      if (process.env.NODE_ENV === 'development') {
        PrismaService.instance.$on('query', (e) => {
          logger.debug(`Query: ${e.query}`);
          logger.debug(`Duration: ${e.duration}ms`);
        });
      }
    }

    return PrismaService.instance;
  }

  public static async connect(): Promise<void> {
    try {
      const prisma = PrismaService.getInstance();
      await prisma.$connect();
      logger.info('✅ Prisma connected successfully');
    } catch (error) {
      logger.error('❌ Prisma connection failed:', error);
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      const prisma = PrismaService.getInstance();
      await prisma.$disconnect();
      logger.info('Prisma disconnected');
    } catch (error) {
      logger.error('Error disconnecting Prisma:', error);
    }
  }
}

export const prisma = PrismaService.getInstance();
export default PrismaService;