import { PrismaClient } from '@prisma/client';
import { IBaseRepository, IPaginationOptions, IPaginationResult, IFilterOptions } from '../types/common.types';
import { PaginationHelper } from '../utils/pagination';

/**
 * Abstract base repository class implementing common CRUD operations
 * Provides type-safe database operations with built-in pagination and filtering
 */
export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  /**
   * Get the Prisma model delegate for the entity
   */
  protected get model() {
    return (this.prisma as any)[this.modelName];
  }

  /**
   * Create a new entity
   */
  async create(data: Partial<T>): Promise<T> {
    return this.model.create({
      data: this.transformCreateData(data),
      include: this.getIncludeOptions()
    });
  }

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      include: this.getIncludeOptions()
    });
  }

  /**
   * Find multiple entities with filtering and pagination
   */
  async findMany(options: IFilterOptions & IPaginationOptions): Promise<IPaginationResult<T>> {
    const { page = 1, limit = 10, sort, ...filters } = options;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);
    const orderBy = this.buildOrderByClause(sort);

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        include: this.getIncludeOptions(),
        skip,
        take: limit,
        orderBy
      }),
      this.model.count({ where })
    ]);

    return PaginationHelper.createPaginationResult(data, total, page, limit);
  }

  /**
   * Update entity by ID
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    return this.model.update({
      where: { id },
      data: this.transformUpdateData(data),
      include: this.getIncludeOptions()
    });
  }

  /**
   * Delete entity by ID
   */
  async delete(id: string): Promise<void> {
    await this.model.delete({
      where: { id }
    });
  }

  /**
   * Count entities with optional filters
   */
  async count(filters?: IFilterOptions): Promise<number> {
    const where = filters ? this.buildWhereClause(filters) : {};
    return this.model.count({ where });
  }

  /**
   * Check if entity exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.model.count({
      where: { id }
    });
    return count > 0;
  }

  /**
   * Find first entity matching criteria
   */
  async findFirst(filters: IFilterOptions): Promise<T | null> {
    const where = this.buildWhereClause(filters);
    return this.model.findFirst({
      where,
      include: this.getIncludeOptions()
    });
  }

  /**
   * Bulk create entities
   */
  async createMany(data: Partial<T>[]): Promise<{ count: number }> {
    return this.model.createMany({
      data: data.map(item => this.transformCreateData(item))
    });
  }

  /**
   * Bulk update entities
   */
  async updateMany(filters: IFilterOptions, data: Partial<T>): Promise<{ count: number }> {
    const where = this.buildWhereClause(filters);
    return this.model.updateMany({
      where,
      data: this.transformUpdateData(data)
    });
  }

  /**
   * Bulk delete entities
   */
  async deleteMany(filters: IFilterOptions): Promise<{ count: number }> {
    const where = this.buildWhereClause(filters);
    return this.model.deleteMany({ where });
  }

  // Abstract methods to be implemented by concrete repositories

  /**
   * Build WHERE clause for filtering
   * Override in concrete repositories for custom filtering logic
   */
  protected abstract buildWhereClause(filters: IFilterOptions): any;

  /**
   * Build ORDER BY clause for sorting
   * Override in concrete repositories for custom sorting logic
   */
  protected buildOrderByClause(sort?: string): any {
    if (!sort) return { createdAt: 'desc' };

    const orderBy: any = {};
    const sortFields = sort.split(',');

    sortFields.forEach(field => {
      if (field.startsWith('-')) {
        orderBy[field.substring(1)] = 'desc';
      } else {
        orderBy[field] = 'asc';
      }
    });

    return orderBy;
  }

  /**
   * Get include options for relations
   * Override in concrete repositories to include related data
   */
  protected getIncludeOptions(): any {
    return {};
  }

  /**
   * Transform data before create operation
   * Override in concrete repositories for custom transformations
   */
  protected transformCreateData(data: Partial<T>): any {
    return data;
  }

  /**
   * Transform data before update operation
   * Override in concrete repositories for custom transformations
   */
  protected transformUpdateData(data: Partial<T>): any {
    return data;
  }

  /**
   * Execute raw query
   */
  protected async executeRaw(query: string, params?: any[]): Promise<any> {
    return this.prisma.$queryRawUnsafe(query, ...(params || []));
  }

  /**
   * Execute transaction
   */
  protected async executeTransaction<R>(
    operations: (prisma: PrismaClient) => Promise<R>
  ): Promise<R> {
    return this.prisma.$transaction(operations);
  }
}