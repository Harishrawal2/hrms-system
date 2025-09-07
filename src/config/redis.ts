import { createClient } from 'redis';
import { logger } from '../utils/logger';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
  },
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    logger.info('✅ Redis connected successfully');

    redisClient.on('error', (error) => {
      logger.error('Redis error:', error);
    });

    redisClient.on('disconnect', () => {
      logger.warn('Redis disconnected');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });

  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    await redisClient.quit();
    logger.info('Redis disconnected');
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error);
  }
};