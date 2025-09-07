import { Document, DocumentType } from '@prisma/client';
import { DocumentDAO, CreateDocumentData, UpdateDocumentData } from '../dao/document.dao';
import { EmployeeDAO } from '../dao/employee.dao';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

export class DocumentService {
  private documentDAO: DocumentDAO;
  private employeeDAO: EmployeeDAO;

  constructor() {
    this.documentDAO = new DocumentDAO();
    this.employeeDAO = new EmployeeDAO();
  }

  async uploadDocument(
    file: Express.Multer.File,
    data: {
      employeeId: string;
      type: DocumentType;
      name: string;
      uploadedBy: string;
    }
  ): Promise<Document> {
    const employee = await this.employeeDAO.findByEmployeeId(data.employeeId);
    if (!employee) {
      throw new ApiError(404, 'Employee not found');
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);

    // Move file to uploads directory
    fs.writeFileSync(filePath, file.buffer);

    const document = await this.documentDAO.create({
      ...data,
      fileName,
      filePath: `/uploads/documents/${fileName}`,
      fileSize: file.size,
      mimeType: file.mimetype
    });

    logger.info(`Document uploaded: ${document.id} for employee ${data.employeeId}`);
    return document;
  }

  async getEmployeeDocuments(employeeId: string): Promise<Document[]> {
    return this.documentDAO.findByEmployeeId(employeeId);
  }

  async getDocuments(filters: {
    employeeId?: string;
    type?: DocumentType;
    isVerified?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ documents: Document[]; total: number; pagination: any }> {
    const { page = 1, limit = 10 } = filters;
    const result = await this.documentDAO.findMany(filters);

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

  async verifyDocument(id: string, verifiedBy: string): Promise<Document> {
    const document = await this.documentDAO.update(id, {
      isVerified: true,
      verifiedBy,
      verifiedAt: new Date()
    });

    logger.info(`Document verified: ${id} by ${verifiedBy}`);
    return document;
  }

  async deleteDocument(id: string): Promise<void> {
    const document = await this.documentDAO.findById(id);
    if (!document) {
      throw new ApiError(404, 'Document not found');
    }

    // Delete file from filesystem
    const fullPath = path.join(process.cwd(), document.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await this.documentDAO.delete(id);
    logger.info(`Document deleted: ${id}`);
  }
}