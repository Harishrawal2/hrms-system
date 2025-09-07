import { Prisma, SystemSettings } from '@prisma/client';
import PrismaService from '../config/prisma';

const prisma = PrismaService.getInstance();

export interface CreateSystemSettingsData {
  key: string;
  value: any;
  type: string;
  updatedBy: string;
}

export class SystemSettingsDAO {
  async create(data: CreateSystemSettingsData): Promise<SystemSettings> {
    return prisma.systemSettings.create({
      data
    });
  }

  async findByKey(key: string): Promise<SystemSettings | null> {
    return prisma.systemSettings.findUnique({
      where: { key }
    });
  }

  async findByType(type: string): Promise<SystemSettings[]> {
    return prisma.systemSettings.findMany({
      where: { type },
      orderBy: { key: 'asc' }
    });
  }

  async findMany(): Promise<SystemSettings[]> {
    return prisma.systemSettings.findMany({
      orderBy: [{ type: 'asc' }, { key: 'asc' }]
    });
  }

  async upsert(key: string, data: CreateSystemSettingsData): Promise<SystemSettings> {
    return prisma.systemSettings.upsert({
      where: { key },
      update: {
        value: data.value,
        updatedBy: data.updatedBy,
        updatedAt: new Date()
      },
      create: data
    });
  }

  async delete(key: string): Promise<SystemSettings> {
    return prisma.systemSettings.delete({
      where: { key }
    });
  }
}