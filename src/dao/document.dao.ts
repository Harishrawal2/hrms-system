import { Prisma, Document, DocumentType } from '@prisma/client';
import PrismaService from '../config/prisma';

const prisma = PrismaService.getInstance();

export interface CreateDocumentData {
  employeeId: string;
  type: DocumentType;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
}

export interface UpdateDocumentData {
  name?: string;
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export class DocumentDAO {
  async create(data: CreateDocumentData): Promise<Document> {
    return prisma.document.create({
      data
    });
  }

  async findById(id: string): Promise<Document | null> {
    return prisma.document.findUnique({
      where: { id }
    });
  }

  async findByEmployeeId(employeeId: string): Promise<Document[]> {
    return prisma.document.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findMany(filters: {
    employeeId?: string;
    type?: DocumentType;
    isVerified?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ documents: Document[]; total: number }> {
    const { employeeId, type, isVerified, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {};
    if (employeeId) where.employeeId = employeeId;
    if (type) where.type = type;
    if (isVerified !== undefined) where.isVerified = isVerified;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.document.count({ where })
    ]);

    return { documents, total };
  }

  async update(id: string, data: UpdateDocumentData): Promise<Document> {
    return prisma.document.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Document> {
    return prisma.document.delete({
      where: { id }
    });
  }
}