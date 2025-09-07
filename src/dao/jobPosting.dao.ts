import { Prisma, JobPosting, EmploymentType, ExperienceLevel } from '@prisma/client';
import PrismaService from '../config/prisma';

const prisma = PrismaService.getInstance();

export interface CreateJobPostingData {
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skillsRequired: string[];
  salaryRange: Prisma.SalaryRangeCreateInput;
  benefits?: string[];
  applicationDeadline: Date;
  postedBy: string;
}

export interface UpdateJobPostingData {
  title?: string;
  department?: string;
  location?: string;
  employmentType?: EmploymentType;
  experienceLevel?: ExperienceLevel;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  skillsRequired?: string[];
  salaryRange?: Prisma.SalaryRangeCreateInput;
  benefits?: string[];
  applicationDeadline?: Date;
  isActive?: boolean;
}

export class JobPostingDAO {
  async create(data: CreateJobPostingData): Promise<JobPosting> {
    return prisma.jobPosting.create({
      data
    });
  }

  async findById(id: string): Promise<JobPosting | null> {
    return prisma.jobPosting.findUnique({
      where: { id }
    });
  }

  async findMany(filters: {
    department?: string;
    employmentType?: EmploymentType;
    experienceLevel?: ExperienceLevel;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobPostings: JobPosting[]; total: number }> {
    const { department, employmentType, experienceLevel, isActive, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.JobPostingWhereInput = {};
    
    if (department) where.department = { contains: department, mode: 'insensitive' };
    if (employmentType) where.employmentType = employmentType;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (isActive !== undefined) where.isActive = isActive;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { skillsRequired: { has: search } }
      ];
    }

    const [jobPostings, total] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.jobPosting.count({ where })
    ]);

    return { jobPostings, total };
  }

  async update(id: string, data: UpdateJobPostingData): Promise<JobPosting> {
    return prisma.jobPosting.update({
      where: { id },
      data
    });
  }

  async incrementApplicantCount(id: string): Promise<JobPosting> {
    return prisma.jobPosting.update({
      where: { id },
      data: {
        applicantCount: {
          increment: 1
        }
      }
    });
  }

  async getActiveJobs(): Promise<JobPosting[]> {
    return prisma.jobPosting.findMany({
      where: {
        isActive: true,
        applicationDeadline: {
          gte: new Date()
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async delete(id: string): Promise<JobPosting> {
    return prisma.jobPosting.delete({
      where: { id }
    });
  }
}