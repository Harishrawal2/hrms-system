import { Prisma, Payroll, PayrollStatus } from '@prisma/client';
import PrismaService from '../config/prisma';

const prisma = PrismaService.getInstance();

export interface CreatePayrollData {
  employeeId: string;
  payPeriod: Prisma.PayPeriodCreateInput;
  basicSalary: number;
  allowances?: Prisma.AllowancesCreateInput;
  deductions?: Prisma.DeductionsCreateInput;
  overtime?: Prisma.OvertimeCreateInput;
  bonus?: number;
  incentives?: number;
  workingDays: number;
  actualWorkingDays: number;
  leaveDays?: number;
  processedBy?: string;
}

export interface UpdatePayrollData {
  status?: PayrollStatus;
  paymentDate?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  processedBy?: string;
  processedDate?: Date;
}

export class PayrollDAO {
  async create(data: CreatePayrollData): Promise<Payroll> {
    // Calculate gross and net salary
    const allowances = data.allowances || {};
    const deductions = data.deductions || {};
    const overtime = data.overtime || { hours: 0, rate: 0, amount: 0 };

    const totalAllowances = Object.values(allowances).reduce((sum: number, val: number) => sum + (val || 0), 0);
    const totalDeductions = Object.values(deductions).reduce((sum: number, val: number) => sum + (val || 0), 0);
    
    const grossSalary = data.basicSalary + totalAllowances + (data.bonus || 0) + (data.incentives || 0) + overtime.amount;
    const netSalary = grossSalary - totalDeductions;

    return prisma.payroll.create({
      data: {
        ...data,
        allowances: allowances as any,
        deductions: deductions as any,
        overtime: overtime as any,
        grossSalary,
        netSalary,
        processedDate: new Date()
      },
      include: {
        employee: {
          select: {
            employeeId: true,
            personalInfo: true,
            bankDetails: true
          }
        }
      }
    });
  }

  async findById(id: string): Promise<Payroll | null> {
    return prisma.payroll.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            employeeId: true,
            personalInfo: true,
            bankDetails: true
          }
        }
      }
    });
  }

  async findByEmployeeAndPeriod(employeeId: string, month: number, year: number): Promise<Payroll | null> {
    return prisma.payroll.findFirst({
      where: {
        employeeId,
        payPeriod: {
          equals: { month, year }
        }
      }
    });
  }

  async findMany(filters: {
    employeeId?: string;
    month?: number;
    year?: number;
    status?: PayrollStatus;
    department?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ payrolls: Payroll[]; total: number }> {
    const { employeeId, month, year, status, department, page = 1, limit = 10, sort } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.PayrollWhereInput = {};
    
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    
    if (department) {
      where.employee = {
        professionalInfo: {
          path: ['department'],
          string_contains: department
        }
      };
    }
    
    if (month && year) {
      where.payPeriod = {
        equals: { month, year }
      };
    } else if (month) {
      where.payPeriod = {
        path: ['month'],
        equals: month
      };
    } else if (year) {
      where.payPeriod = {
        path: ['year'],
        equals: year
      };
    }

    // Parse sort parameter
    let orderBy: any = [
      { payPeriod: { sort: 'desc' } },
      { createdAt: 'desc' }
    ];
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

    const [payrolls, total] = await Promise.all([
      prisma.payroll.findMany({
        where,
        include: {
          employee: {
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
      prisma.payroll.count({ where })
    ]);

    return { payrolls, total };
  }

  async update(id: string, data: UpdatePayrollData): Promise<Payroll> {
    return prisma.payroll.update({
      where: { id },
      data,
      include: {
        employee: {
          select: {
            employeeId: true,
            personalInfo: true,
            bankDetails: true
          }
        }
      }
    });
  }

  async getPayrollSummary(filters: {
    month?: number;
    year?: number;
    department?: string;
  }): Promise<any> {
    const { month, year, department } = filters;
    
    const where: Prisma.PayrollWhereInput = {};
    
    if (month && year) {
      where.payPeriod = {
        equals: { month, year }
      };
    }

    return prisma.payroll.aggregate({
      where,
      _sum: {
        grossSalary: true,
        netSalary: true,
        basicSalary: true
      },
      _avg: {
        grossSalary: true,
        netSalary: true
      },
      _count: {
        _all: true
      }
    });
  }

  async delete(id: string): Promise<Payroll> {
    return prisma.payroll.delete({
      where: { id }
    });
  }
}