import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

// Initialize Supabase client with service role (for backend operations)
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const getSupabaseClient = () => supabase;

// Helper function to execute raw SQL queries
export const query = async (sql: string, params?: any[]) => {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql,
      params: params || [],
    });

    if (error) throw error;
    return { rows: data, error: null };
  } catch (error) {
    console.error('Query error:', error);
    return { rows: null, error };
  }
};

// Helper function for table operations
export const tableQuery = async (
  table: string,
  operation: 'select' | 'insert' | 'update' | 'delete' = 'select',
  options: {
    conditions?: any;
    data?: any;
    select?: string;
  } = {}
) => {
  try {
    let query = supabase.from(table);

    switch (operation) {
      case 'select':
        return await query.select(options.select || '*').match(options.conditions || {});

      case 'insert':
        return await query.insert(options.data);

      case 'update':
        return await query.update(options.data).match(options.conditions || {});

      case 'delete':
        return await query.delete().match(options.conditions || {});

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error) {
    console.error(`Table query error on ${table}:`, error);
    throw error;
  }
};

export default supabase;
