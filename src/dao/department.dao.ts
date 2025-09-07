import { Prisma, Department } from '@prisma/client';
import PrismaService from '../config/prisma';

const prisma = PrismaService.getInstance();

export interface CreateDepartmentData {
  name: string;
  description?: string;
  headId?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  description?: string;
  headId?: string;
  isActive?: boolean;
}

export class DepartmentDAO {
  async create(data: CreateDepartmentData): Promise<Department> {
    return prisma.department.create({
      data
    });
  }

  async findById(id: string): Promise<Department | null> {
    return prisma.department.findUnique({
      where: { id }
    });
  }

  async findByName(name: string): Promise<Department | null> {
    return prisma.department.findUnique({
      where: { name }
    });
  }

  async findMany(filters: {
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ departments: Department[]; total: number }> {
    const { isActive, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.DepartmentWhereInput = {};
    if (isActive !== undefined) where.isActive = isActive;
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.department.count({ where })
    ]);

    return { departments, total };
  }

  async update(id: string, data: UpdateDepartmentData): Promise<Department> {
    return prisma.department.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Department> {
    return prisma.department.delete({
      where: { id }
    });
  }
}