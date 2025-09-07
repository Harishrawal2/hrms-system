import { Prisma, Designation } from '@prisma/client';
import PrismaService from '../config/prisma';

const prisma = PrismaService.getInstance();

export interface CreateDesignationData {
  title: string;
  description?: string;
  level?: number;
}

export interface UpdateDesignationData {
  title?: string;
  description?: string;
  level?: number;
  isActive?: boolean;
}

export class DesignationDAO {
  async create(data: CreateDesignationData): Promise<Designation> {
    return prisma.designation.create({
      data
    });
  }

  async findById(id: string): Promise<Designation | null> {
    return prisma.designation.findUnique({
      where: { id }
    });
  }

  async findByTitle(title: string): Promise<Designation | null> {
    return prisma.designation.findUnique({
      where: { title }
    });
  }

  async findMany(filters: {
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ designations: Designation[]; total: number }> {
    const { isActive, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.DesignationWhereInput = {};
    if (isActive !== undefined) where.isActive = isActive;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [designations, total] = await Promise.all([
      prisma.designation.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ level: 'asc' }, { title: 'asc' }]
      }),
      prisma.designation.count({ where })
    ]);

    return { designations, total };
  }

  async update(id: string, data: UpdateDesignationData): Promise<Designation> {
    return prisma.designation.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Designation> {
    return prisma.designation.delete({
      where: { id }
    });
  }
}