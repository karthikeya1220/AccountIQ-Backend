import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

// Create Supabase client with service role (for backend use)
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Create Supabase client without service role for auth operations
export const supabaseAuth = createClient(supabaseUrl, supabaseServiceRoleKey);

// Type for query results
export interface QueryResult<T = any> {
  data: T | null;
  error: any;
  status: number;
  statusText: string;
}

// Helper function for queries (similar to pg pool.query)
export const query = async (
  table: string,
  operation: 'select' | 'insert' | 'update' | 'delete',
  conditions?: any,
  data?: any
): Promise<QueryResult> => {
  try {
    let query = supabase.from(table);

    switch (operation) {
      case 'select':
        const { data: selectData, error: selectError, status, statusText } = await query.select('*').match(conditions || {});
        return { data: selectData, error: selectError, status, statusText };

      case 'insert':
        const { data: insertData, error: insertError, status: insertStatus, statusText: insertStatusText } = await query.insert(data);
        return { data: insertData, error: insertError, status: insertStatus, statusText: insertStatusText };

      case 'update':
        const { data: updateData, error: updateError, status: updateStatus, statusText: updateStatusText } = await query
          .update(data)
          .match(conditions);
        return { data: updateData, error: updateError, status: updateStatus, statusText: updateStatusText };

      case 'delete':
        const { data: deleteData, error: deleteError, status: deleteStatus, statusText: deleteStatusText } = await query.delete().match(
          conditions
        );
        return { data: deleteData, error: deleteError, status: deleteStatus, statusText: deleteStatusText };

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error) {
    console.error(`Supabase query error:`, error);
    throw error;
  }
};

// RPC function call helper
export const rpc = async (functionName: string, params?: any): Promise<QueryResult> => {
  try {
    const { data, error, status, statusText } = await supabase.rpc(functionName, params || {});
    return { data, error, status, statusText };
  } catch (error) {
    console.error(`Supabase RPC error:`, error);
    throw error;
  }
};

export default supabase;
