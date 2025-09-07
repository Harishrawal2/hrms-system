import { Prisma, Expense, ExpenseStatus, ExpenseCategory } from '@prisma/client';
import PrismaService from '../config/prisma';

const prisma = PrismaService.getInstance();

export interface CreateExpenseData {
  employeeId: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  receiptUrl?: string;
}

export interface UpdateExpenseData {
  status?: ExpenseStatus;
  approvedBy?: string;
  approvedDate?: Date;
  rejectionReason?: string;
  reimbursedDate?: Date;
}

export class ExpenseDAO {
  async create(data: CreateExpenseData): Promise<Expense> {
    return prisma.expense.create({
      data
    });
  }

  async findById(id: string): Promise<Expense | null> {
    return prisma.expense.findUnique({
      where: { id }
    });
  }

  async findMany(filters: {
    employeeId?: string;
    category?: ExpenseCategory;
    status?: ExpenseStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ expenses: Expense[]; total: number }> {
    const { employeeId, category, status, startDate, endDate, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ExpenseWhereInput = {};
    if (employeeId) where.employeeId = employeeId;
    if (category) where.category = category;
    if (status) where.status = status;
    
    if (startDate && endDate) {
      where.submittedDate = {
        gte: startDate,
        lte: endDate
      };
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedDate: 'desc' }
      }),
      prisma.expense.count({ where })
    ]);

    return { expenses, total };
  }

  async update(id: string, data: UpdateExpenseData): Promise<Expense> {
    return prisma.expense.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Expense> {
    return prisma.expense.delete({
      where: { id }
    });
  }
}