export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginationResult<T> {
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

export class PaginationHelper {
  static parsePagination(query: any): PaginationOptions {
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 10, 100); // Max 100 items per page
    const sort = query.sort || '-createdAt';

    return { page, limit, sort };
  }

  static parseSort(sortString: string): any {
    const sorts: any = {};
    
    if (sortString) {
      const sortFields = sortString.split(',');
      
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sorts[field.substring(1)] = 'desc';
        } else {
          sorts[field] = 'asc';
        }
      });
    }

    return Object.keys(sorts).length > 0 ? sorts : { createdAt: 'desc' };
  }

  static createPaginationResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): PaginationResult<T> {
    const pages = Math.ceil(total / limit);
    
    return {
      data,
      pagination: {
        current: page,
        pages,
        total,
        limit,
        hasNext: page < pages,
        hasPrev: page > 1
      }
    };
  }
}