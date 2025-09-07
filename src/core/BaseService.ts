import { IBaseRepository, IPaginationOptions, IPaginationResult, IFilterOptions, IServiceResponse } from '../types/common.types';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

/**
 * Abstract base service class implementing common business logic patterns
 * Provides standardized service methods with error handling and logging
 */
export abstract class BaseService<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  protected repository: IBaseRepository<T>;
  protected entityName: string;

  constructor(repository: IBaseRepository<T>, entityName: string) {
    this.repository = repository;
    this.entityName = entityName;
  }

  /**
   * Create a new entity with validation
   */
  async create(data: CreateDTO, userId?: string): Promise<IServiceResponse<T>> {
    try {
      // Validate input data
      await this.validateCreateData(data);

      // Transform data if needed
      const transformedData = await this.transformCreateData(data, userId);

      // Check business rules
      await this.checkCreateBusinessRules(transformedData);

      // Create entity
      const entity = await this.repository.create(transformedData);

      // Post-creation hooks
      await this.afterCreate(entity, userId);

      logger.info(`${this.entityName} created successfully`, { id: (entity as any).id, userId });

      return {
        success: true,
        data: entity,
        message: `${this.entityName} created successfully`
      };
    } catch (error) {
      logger.error(`Failed to create ${this.entityName}`, { error: error.message, data, userId });
      throw error;
    }
  }

  /**
   * Get entity by ID with authorization check
   */
  async getById(id: string, userId?: string): Promise<IServiceResponse<T>> {
    try {
      const entity = await this.repository.findById(id);
      
      if (!entity) {
        throw new ApiError(404, `${this.entityName} not found`);
      }

      // Check access permissions
      await this.checkReadAccess(entity, userId);

      return {
        success: true,
        data: entity,
        message: `${this.entityName} retrieved successfully`
      };
    } catch (error) {
      logger.error(`Failed to get ${this.entityName}`, { error: error.message, id, userId });
      throw error;
    }
  }

  /**
   * Get multiple entities with filtering and pagination
   */
  async getMany(
    options: IFilterOptions & IPaginationOptions,
    userId?: string
  ): Promise<IServiceResponse<IPaginationResult<T>>> {
    try {
      // Apply user-specific filters
      const filteredOptions = await this.applyUserFilters(options, userId);

      // Get entities
      const result = await this.repository.findMany(filteredOptions);

      // Transform results if needed
      const transformedResult = await this.transformGetManyResult(result, userId);

      return {
        success: true,
        data: transformedResult,
        message: `${this.entityName} list retrieved successfully`
      };
    } catch (error) {
      logger.error(`Failed to get ${this.entityName} list`, { error: error.message, options, userId });
      throw error;
    }
  }

  /**
   * Update entity with validation and authorization
   */
  async update(id: string, data: UpdateDTO, userId?: string): Promise<IServiceResponse<T>> {
    try {
      // Check if entity exists
      const existingEntity = await this.repository.findById(id);
      if (!existingEntity) {
        throw new ApiError(404, `${this.entityName} not found`);
      }

      // Check update permissions
      await this.checkUpdateAccess(existingEntity, userId);

      // Validate update data
      await this.validateUpdateData(data, existingEntity);

      // Transform data
      const transformedData = await this.transformUpdateData(data, existingEntity, userId);

      // Check business rules
      await this.checkUpdateBusinessRules(transformedData, existingEntity);

      // Update entity
      const updatedEntity = await this.repository.update(id, transformedData);

      // Post-update hooks
      await this.afterUpdate(updatedEntity, existingEntity, userId);

      logger.info(`${this.entityName} updated successfully`, { id, userId });

      return {
        success: true,
        data: updatedEntity,
        message: `${this.entityName} updated successfully`
      };
    } catch (error) {
      logger.error(`Failed to update ${this.entityName}`, { error: error.message, id, data, userId });
      throw error;
    }
  }

  /**
   * Delete entity with authorization check
   */
  async delete(id: string, userId?: string): Promise<IServiceResponse<void>> {
    try {
      // Check if entity exists
      const entity = await this.repository.findById(id);
      if (!entity) {
        throw new ApiError(404, `${this.entityName} not found`);
      }

      // Check delete permissions
      await this.checkDeleteAccess(entity, userId);

      // Check business rules
      await this.checkDeleteBusinessRules(entity);

      // Pre-delete hooks
      await this.beforeDelete(entity, userId);

      // Delete entity
      await this.repository.delete(id);

      // Post-delete hooks
      await this.afterDelete(entity, userId);

      logger.info(`${this.entityName} deleted successfully`, { id, userId });

      return {
        success: true,
        message: `${this.entityName} deleted successfully`
      };
    } catch (error) {
      logger.error(`Failed to delete ${this.entityName}`, { error: error.message, id, userId });
      throw error;
    }
  }

  // Abstract methods to be implemented by concrete services

  /**
   * Validate data before creation
   */
  protected abstract validateCreateData(data: CreateDTO): Promise<void>;

  /**
   * Validate data before update
   */
  protected abstract validateUpdateData(data: UpdateDTO, existingEntity: T): Promise<void>;

  /**
   * Transform data before creation
   */
  protected async transformCreateData(data: CreateDTO, userId?: string): Promise<any> {
    return data;
  }

  /**
   * Transform data before update
   */
  protected async transformUpdateData(data: UpdateDTO, existingEntity: T, userId?: string): Promise<any> {
    return data;
  }

  /**
   * Check business rules before creation
   */
  protected async checkCreateBusinessRules(data: any): Promise<void> {
    // Override in concrete services
  }

  /**
   * Check business rules before update
   */
  protected async checkUpdateBusinessRules(data: any, existingEntity: T): Promise<void> {
    // Override in concrete services
  }

  /**
   * Check business rules before deletion
   */
  protected async checkDeleteBusinessRules(entity: T): Promise<void> {
    // Override in concrete services
  }

  /**
   * Check if user can read the entity
   */
  protected async checkReadAccess(entity: T, userId?: string): Promise<void> {
    // Override in concrete services for authorization logic
  }

  /**
   * Check if user can update the entity
   */
  protected async checkUpdateAccess(entity: T, userId?: string): Promise<void> {
    // Override in concrete services for authorization logic
  }

  /**
   * Check if user can delete the entity
   */
  protected async checkDeleteAccess(entity: T, userId?: string): Promise<void> {
    // Override in concrete services for authorization logic
  }

  /**
   * Apply user-specific filters to queries
   */
  protected async applyUserFilters(
    options: IFilterOptions & IPaginationOptions,
    userId?: string
  ): Promise<IFilterOptions & IPaginationOptions> {
    // Override in concrete services for user-specific filtering
    return options;
  }

  /**
   * Transform get many results
   */
  protected async transformGetManyResult(
    result: IPaginationResult<T>,
    userId?: string
  ): Promise<IPaginationResult<T>> {
    // Override in concrete services for result transformation
    return result;
  }

  // Lifecycle hooks

  /**
   * Hook called after successful creation
   */
  protected async afterCreate(entity: T, userId?: string): Promise<void> {
    // Override in concrete services
  }

  /**
   * Hook called after successful update
   */
  protected async afterUpdate(updatedEntity: T, originalEntity: T, userId?: string): Promise<void> {
    // Override in concrete services
  }

  /**
   * Hook called before deletion
   */
  protected async beforeDelete(entity: T, userId?: string): Promise<void> {
    // Override in concrete services
  }

  /**
   * Hook called after successful deletion
   */
  protected async afterDelete(entity: T, userId?: string): Promise<void> {
    // Override in concrete services
  }

  /**
   * Utility method to check if entity exists
   */
  protected async ensureExists(id: string): Promise<T> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new ApiError(404, `${this.entityName} not found`);
    }
    return entity;
  }

  /**
   * Utility method to check uniqueness
   */
  protected async ensureUnique(filters: IFilterOptions, excludeId?: string): Promise<void> {
    const existing = await this.repository.findFirst(filters);
    if (existing && (!excludeId || (existing as any).id !== excludeId)) {
      throw new ApiError(400, `${this.entityName} already exists`);
    }
  }
}