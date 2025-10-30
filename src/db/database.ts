import { supabase } from './supabase-client';

/**
 * Database Service - Handles all Supabase database operations
 */
export class DatabaseService {
  /**
   * Generic query builder for Supabase
   */
  from(table: string) {
    return supabase.from(table);
  }

  /**
   * Select with filters, sorting, and pagination
   */
  async select<T = any>(
    table: string,
    options?: {
      columns?: string;
      filters?: Record<string, any>;
      sort?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
    }
  ): Promise<T[]> {
    try {
      let query: any = supabase.from(table);

      // Select columns
      if (options?.columns) {
        query = query.select(options.columns);
      } else {
        query = query.select('*');
      }

      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply sorting
      if (options?.sort) {
        query = query.order(options.sort.column, {
          ascending: options.sort.ascending ?? false,
        });
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Database select error on table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Get single record
   */
  async selectOne<T = any>(
    table: string,
    filters: Record<string, any>
  ): Promise<T | null> {
    try {
      let query: any = supabase.from(table).select('*');

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query.single().catch(() => ({ data: null, error: null }));

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found (not an error)
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error(`Database selectOne error on table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Insert record(s)
   */
  async insert<T = any>(table: string, data: T | T[]): Promise<T[]> {
    try {
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert(Array.isArray(data) ? data : [data])
        .select();

      if (error) {
        throw error;
      }

      return insertedData || [];
    } catch (error) {
      console.error(`Database insert error on table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Update records
   */
  async update<T = any>(
    table: string,
    data: Partial<T>,
    filters: Record<string, any>
  ): Promise<T[]> {
    try {
      let query: any = supabase.from(table).update(data);

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data: updatedData, error } = await query.select();

      if (error) {
        throw error;
      }

      return updatedData || [];
    } catch (error) {
      console.error(`Database update error on table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Delete records
   */
  async delete<T = any>(
    table: string,
    filters: Record<string, any>
  ): Promise<T[]> {
    try {
      let query: any = supabase.from(table).delete();

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data: deletedData, error } = await query.select();

      if (error) {
        throw error;
      }

      return deletedData || [];
    } catch (error) {
      console.error(`Database delete error on table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Execute RPC function
   */
  async rpc<T = any>(functionName: string, params?: Record<string, any>): Promise<T> {
    try {
      const { data, error } = await supabase.rpc(functionName, params || {});

      if (error) {
        throw error;
      }

      return data as T;
    } catch (error) {
      console.error(`Database RPC error (${functionName}):`, error);
      throw error;
    }
  }

  /**
   * Execute raw SQL (use with caution)
   */
  async sql<T = any>(query: string, values?: any[]): Promise<T[]> {
    try {
      // Note: Direct SQL execution requires a different approach with Supabase
      // This is a placeholder - Supabase doesn't expose raw SQL execution by default
      // Use RPC functions or REST endpoints instead
      throw new Error(
        'Raw SQL not supported. Use RPC functions or REST endpoints instead.'
      );
    } catch (error) {
      console.error('Database SQL error:', error);
      throw error;
    }
  }

  /**
   * Get row count
   */
  async count(table: string, filters?: Record<string, any>): Promise<number> {
    try {
      let query = supabase.from(table).select('*', { count: 'exact', head: true });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value) as any;
        });
      }

      const { count, error } = await query;

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error(`Database count error on table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Transaction support (batch operations)
   * Note: Supabase doesn't support true transactions via REST API
   * This is a helper for multiple operations
   */
  async batch<T = any>(
    operations: Array<{
      type: 'insert' | 'update' | 'delete';
      table: string;
      data?: any;
      filters?: Record<string, any>;
    }>
  ): Promise<T[][]> {
    const results: T[][] = [];

    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'insert':
            results.push(
              await this.insert<T>(operation.table, operation.data || {})
            );
            break;
          case 'update':
            results.push(
              await this.update<T>(
                operation.table,
                operation.data || {},
                operation.filters || {}
              )
            );
            break;
          case 'delete':
            results.push(await this.delete<T>(operation.table, operation.filters || {}));
            break;
        }
      } catch (error) {
        console.error(
          `Batch operation failed for table ${operation.table}:`,
          error
        );
        // Continue with next operation, but log the error
      }
    }

    return results;
  }
}

// Export singleton instance
export const db = new DatabaseService();
export default db;
