// Common TypeScript interfaces and types for the HRMS system

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface IPaginationResult<T> {
  data: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: string[];
}

export interface IFilterOptions {
  search?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  [key: string]: any;
}

export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditableEntity extends IBaseEntity {
  createdBy?: string;
  updatedBy?: string;
}

export interface ISoftDeletableEntity extends IBaseEntity {
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}

// Service method signatures
export interface IServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Repository interfaces
export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findMany(filters: IFilterOptions & IPaginationOptions): Promise<IPaginationResult<T>>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  count(filters?: IFilterOptions): Promise<number>;
}

// Authentication types
export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthUser {
  id: string;
  email: string;
  role: string;
  permissions?: string[];
  employeeId?: string;
}

// Email types
export interface IEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: any[];
}

// File upload types
export interface IFileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// Error types
export interface IApiError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Configuration types
export interface IDatabaseConfig {
  url: string;
  maxConnections?: number;
  timeout?: number;
}

export interface IRedisConfig {
  url: string;
  maxRetries?: number;
  retryDelay?: number;
}

export interface IEmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Validation types
export interface IValidationError {
  field: string;
  message: string;
  value?: any;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;