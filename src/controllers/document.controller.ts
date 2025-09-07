import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service';
import { sendResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError } from '../utils/ApiError';

export class DocumentController {
  private documentService: DocumentService;

  constructor() {
    this.documentService = new DocumentService();
  }

  uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
      }

      const document = await this.documentService.uploadDocument(req.file, {
        ...req.body,
        uploadedBy: req.user!.id
      });

      sendResponse(res, 201, document, 'Document uploaded successfully');
    } catch (error) {
      next(error);
    }
  };

  getEmployeeDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { employeeId } = req.params;
      const documents = await this.documentService.getEmployeeDocuments(employeeId);
      sendResponse(res, 200, documents, 'Employee documents fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.documentService.getDocuments(req.query as any);
      sendResponse(res, 200, result, 'Documents fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  verifyDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const document = await this.documentService.verifyDocument(id, req.user!.id);
      sendResponse(res, 200, document, 'Document verified successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.documentService.deleteDocument(id);
      sendResponse(res, 200, null, 'Document deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}