import { Prisma, Employee } from '@prisma/client';
import PrismaService from '../config/prisma';

const prisma = PrismaService.getInstance();

export interface CreateEmployeeData {
  employeeId: string;
  userId: string;
  personalInfo: Prisma.PersonalInfoCreateInput;
  professionalInfo: Prisma.ProfessionalInfoCreateInput;
  emergencyContact: Prisma.EmergencyContactCreateInput;
  documents?: Prisma.DocumentCreateInput[];
  bankDetails?: Prisma.BankDetailsCreateInput;
}

export interface UpdateEmployeeData {
  personalInfo?: Partial<Prisma.PersonalInfoCreateInput>;
  professionalInfo?: Partial<Prisma.ProfessionalInfoCreateInput>;
  emergencyContact?: Partial<Prisma.EmergencyContactCreateInput>;
  bankDetails?: Partial<Prisma.BankDetailsCreateInput>;
  isActive?: boolean;
  terminationDate?: Date;
  terminationReason?: string;
}

export class EmployeeDAO {
  async create(data: CreateEmployeeData): Promise<Employee> {
    return prisma.employee.create({
      data,
      include: {
        user: true,
        manager: {
          select: {
            employeeId: true,
            personalInfo: true
          }
        }
      }
    });
  }

  async findById(id: string): Promise<Employee | null> {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        user: true,
        manager: {
          select: {
            employeeId: true,
            personalInfo: true
          }
        },
        managedEmployees: {
          select: {
            employeeId: true,
            personalInfo: true
          }
        }
      }
    });
  }

  async findByEmployeeId(employeeId: string): Promise<Employee | null> {
    return prisma.employee.findUnique({
      where: { employeeId },
      include: {
        user: true,
        manager: {
          select: {
            employeeId: true,
            personalInfo: true
          }
        }
      }
    });
  }

  async findByUserId(userId: string): Promise<Employee | null> {
    return prisma.employee.findUnique({
      where: { userId },
      include: {
        user: true,
        manager: {
          select: {
            employeeId: true,
            personalInfo: true
          }
        }
      }
    });
  }

  async findMany(filters: {
    department?: string;
    designation?: string;
    isActive?: boolean;
    search?: string;
    managerId?: string;
    employmentType?: string;
    workLocation?: string;
    joiningDateFrom?: Date;
    joiningDateTo?: Date;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ employees: Employee[]; total: number }> {
    const { 
      department, 
      designation, 
      isActive, 
      search, 
      managerId, 
      employmentType,
      workLocation,
      joiningDateFrom,
      joiningDateTo,
      page = 1, 
      limit = 10,
      sort 
    } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeWhereInput = {};
    
    if (isActive !== undefined) where.isActive = isActive;
    if (managerId) where.managerId = managerId;
    
    // Professional info filters
    const professionalFilters: any = {};
    if (department) professionalFilters.department = { contains: department, mode: 'insensitive' };
    if (designation) professionalFilters.designation = { contains: designation, mode: 'insensitive' };
    if (employmentType) professionalFilters.employmentType = employmentType;
    if (workLocation) professionalFilters.workLocation = workLocation;
    
    if (joiningDateFrom || joiningDateTo) {
      professionalFilters.joiningDate = {};
      if (joiningDateFrom) professionalFilters.joiningDate.gte = joiningDateFrom;
      if (joiningDateTo) professionalFilters.joiningDate.lte = joiningDateTo;
    }

    if (Object.keys(professionalFilters).length > 0) {
      where.professionalInfo = { is: professionalFilters };
    }

    if (search) {
      where.OR = [
        { personalInfo: { path: ['firstName'], string_contains: search } },
        { personalInfo: { path: ['lastName'], string_contains: search } },
        { employeeId: { contains: search, mode: 'insensitive' } }
      ];
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

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              role: true,
              isActive: true,
              lastLogin: true
            }
          },
          manager: {
            select: {
              employeeId: true,
              personalInfo: true
            }
          }
        },
        skip,
        take: limit,
        orderBy
      }),
      prisma.employee.count({ where })
    ]);

    return { employees, total };
  }

  async update(employeeId: string, data: UpdateEmployeeData): Promise<Employee> {
    return prisma.employee.update({
      where: { employeeId },
      data,
      include: {
        user: true,
        manager: {
          select: {
            employeeId: true,
            personalInfo: true
          }
        }
      }
    });
  }

  async delete(employeeId: string): Promise<Employee> {
    return prisma.employee.delete({
      where: { employeeId }
    });
  }

  async getTeamMembers(managerId: string): Promise<Employee[]> {
    return prisma.employee.findMany({
      where: {
        managerId,
        isActive: true
      },
      select: {
        id: true,
        employeeId: true,
        personalInfo: true,
        professionalInfo: true
      }
    });
  }

  async getDepartments(): Promise<string[]> {
    const result = await prisma.employee.findMany({
      where: { isActive: true },
      select: {
        professionalInfo: true
      }
    });

    const departments = [...new Set(result.map(emp => emp.professionalInfo.department))];
    return departments;
  }

  async getDesignations(): Promise<string[]> {
    const result = await prisma.employee.findMany({
      where: { isActive: true },
      select: {
        professionalInfo: true
      }
    });

    const designations = [...new Set(result.map(emp => emp.professionalInfo.designation))];
    return designations;
  }
}