import { Prisma, User, Role } from '@prisma/client';
import PrismaService from '../config/prisma';

const prisma = PrismaService.getInstance();

export interface CreateUserData {
  email: string;
  password: string;
  role?: Role;
  employeeId?: string;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  emailVerified?: boolean;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  role?: Role;
  isActive?: boolean;
  lastLogin?: Date;
  employeeId?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  twoFactorSecret?: string;
  twoFactorEnabled?: boolean;
}

export class UserDAO {
  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        refreshTokens: []
      }
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        employee: true
      }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        employee: true
      }
    });
  }

  async findByEmployeeId(employeeId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { employeeId },
      include: {
        employee: true
      }
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  async addRefreshToken(id: string, token: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        refreshTokens: {
          push: token
        }
      }
    });
  }

  async removeRefreshToken(id: string, token: string): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    return prisma.user.update({
      where: { id },
      data: {
        refreshTokens: user.refreshTokens.filter(t => t !== token)
      }
    });
  }

  async clearRefreshTokens(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        refreshTokens: []
      }
    });
  }

  async findMany(filters: {
    role?: Role;
    isActive?: boolean;
    emailVerified?: boolean;
    search?: string;
    department?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ users: User[]; total: number }> {
    const { role, isActive, emailVerified, search, department, page = 1, limit = 10, sort } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    if (emailVerified !== undefined) where.emailVerified = emailVerified;

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { employee: { personalInfo: { path: ['firstName'], string_contains: search } } },
        { employee: { personalInfo: { path: ['lastName'], string_contains: search } } }
      ];
    }

    if (department) {
      where.employee = {
        professionalInfo: {
          path: ['department'],
          string_contains: department
        }
      };
    }

    // Parse sort parameter
    let orderBy: any = { createdAt: 'desc' };
    if (sort) {
      const sortFields = sort.split(',');
      orderBy = {};
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          orderBy[field.substring(1)] = 'desc';
        } else {
          orderBy[field] = 'asc';
        }
      });
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          employee: {
            select: {
              employeeId: true,
              personalInfo: true,
              professionalInfo: true
            }
          }
        },
        skip,
        take: limit,
        orderBy
      }),
      prisma.user.count({ where })
    ]);

    return { users, total };
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        }
      }
    });
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id }
    });
  }
}