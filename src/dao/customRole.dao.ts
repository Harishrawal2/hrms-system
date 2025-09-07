import { Prisma, CustomRole } from '@prisma/client';
import PrismaService from '../config/prisma';

const prisma = PrismaService.getInstance();

export interface CreateCustomRoleData {
  name: string;
  description?: string;
  permissions: string[];
  createdBy: string;
}

export interface UpdateCustomRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export class CustomRoleDAO {
  async create(data: CreateCustomRoleData): Promise<CustomRole> {
    return prisma.customRole.create({
      data
    });
  }

  async findById(id: string): Promise<CustomRole | null> {
    return prisma.customRole.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            employeeId: true
          }
        }
      }
    });
  }

  async findByName(name: string): Promise<CustomRole | null> {
    return prisma.customRole.findUnique({
      where: { name }
    });
  }

  async findMany(filters: {
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ roles: CustomRole[]; total: number }> {
    const { isActive, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomRoleWhereInput = {};
    if (isActive !== undefined) where.isActive = isActive;
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [roles, total] = await Promise.all([
      prisma.customRole.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              email: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customRole.count({ where })
    ]);

    return { roles, total };
  }

  async update(id: string, data: UpdateCustomRoleData): Promise<CustomRole> {
    return prisma.customRole.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<CustomRole> {
    return prisma.customRole.delete({
      where: { id }
    });
  }
}