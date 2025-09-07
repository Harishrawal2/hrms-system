import { Request, Response, NextFunction } from 'express';
import { RecruitmentService } from '../services/recruitment.service';
import { sendResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export class RecruitmentController {
  private recruitmentService: RecruitmentService;

  constructor() {
    this.recruitmentService = new RecruitmentService();
  }

  createJobPosting = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const jobPosting = await this.recruitmentService.createJobPosting(req.body, req.user!.id);
      sendResponse(res, 201, jobPosting, 'Job posting created successfully');
    } catch (error) {
      next(error);
    }
  };

  getJobPostings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.recruitmentService.getJobPostings(req.query as any);
      sendResponse(res, 200, result, 'Job postings fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getJobPostingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobPosting = await this.recruitmentService.getJobPostingById(req.params.id);
      sendResponse(res, 200, jobPosting, 'Job posting fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  updateJobPosting = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobPosting = await this.recruitmentService.updateJobPosting(req.params.id, req.body);
      sendResponse(res, 200, jobPosting, 'Job posting updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deactivateJobPosting = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobPosting = await this.recruitmentService.deactivateJobPosting(req.params.id);
      sendResponse(res, 200, jobPosting, 'Job posting deactivated successfully');
    } catch (error) {
      next(error);
    }
  };

  getActiveJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobs = await this.recruitmentService.getActiveJobs();
      sendResponse(res, 200, jobs, 'Active jobs fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  applyForJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { jobId } = req.params;
      await this.recruitmentService.applyForJob(jobId, req.body);
      sendResponse(res, 200, null, 'Application submitted successfully');
    } catch (error) {
      next(error);
    }
  };
}