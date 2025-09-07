import { JobPosting, EmploymentType, ExperienceLevel } from '@prisma/client';
import { JobPostingDAO, CreateJobPostingData, UpdateJobPostingData } from '../dao/jobPosting.dao';
import { EmployeeDAO } from '../dao/employee.dao';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export class RecruitmentService {
  private jobPostingDAO: JobPostingDAO;
  private employeeDAO: EmployeeDAO;

  constructor() {
    this.jobPostingDAO = new JobPostingDAO();
    this.employeeDAO = new EmployeeDAO();
  }

  async createJobPosting(data: CreateJobPostingData, postedBy: string): Promise<JobPosting> {
    const poster = await this.employeeDAO.findByUserId(postedBy);
    if (!poster) {
      throw new ApiError(404, 'Employee profile not found');
    }

    const jobPosting = await this.jobPostingDAO.create({
      ...data,
      postedBy: poster.employeeId
    });

    logger.info(`Job posting created: ${jobPosting.id} by ${poster.employeeId}`);
    return jobPosting;
  }

  async getJobPostings(filters: {
    department?: string;
    employmentType?: EmploymentType;
    experienceLevel?: ExperienceLevel;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobPostings: JobPosting[]; total: number; pagination: any }> {
    const { page = 1, limit = 10 } = filters;
    const result = await this.jobPostingDAO.findMany(filters);

    return {
      ...result,
      pagination: {
        current: page,
        pages: Math.ceil(result.total / limit),
        total: result.total,
        limit
      }
    };
  }

  async getJobPostingById(id: string): Promise<JobPosting> {
    const jobPosting = await this.jobPostingDAO.findById(id);
    if (!jobPosting) {
      throw new ApiError(404, 'Job posting not found');
    }
    return jobPosting;
  }

  async updateJobPosting(id: string, data: UpdateJobPostingData): Promise<JobPosting> {
    const jobPosting = await this.jobPostingDAO.update(id, data);
    logger.info(`Job posting updated: ${id}`);
    return jobPosting;
  }

  async deactivateJobPosting(id: string): Promise<JobPosting> {
    const jobPosting = await this.jobPostingDAO.update(id, { isActive: false });
    logger.info(`Job posting deactivated: ${id}`);
    return jobPosting;
  }

  async getActiveJobs(): Promise<JobPosting[]> {
    return this.jobPostingDAO.getActiveJobs();
  }

  async applyForJob(jobId: string, applicantData: any): Promise<void> {
    const jobPosting = await this.jobPostingDAO.findById(jobId);
    if (!jobPosting) {
      throw new ApiError(404, 'Job posting not found');
    }

    if (!jobPosting.isActive) {
      throw new ApiError(400, 'Job posting is no longer active');
    }

    if (new Date() > jobPosting.applicationDeadline) {
      throw new ApiError(400, 'Application deadline has passed');
    }

    // Increment applicant count
    await this.jobPostingDAO.incrementApplicantCount(jobId);

    // Here you would typically save the application data
    // For now, we'll just log it
    logger.info(`Job application submitted for job: ${jobId}`);
  }
}