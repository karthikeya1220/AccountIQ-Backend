import { query } from './db';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Initialize database with comprehensive schema
 * This function reads and executes the complete schema.sql file
 */
export const initializeDatabase = async () => {
  try {
    console.log('Initializing database with comprehensive schema...');
    
    // Read the SQL schema file
    const schemaPath = join(__dirname, 'schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await query(schemaSql);
    
    console.log('✓ Database schema initialized successfully');
    console.log('✓ All tables, indexes, triggers, and views created');
  } catch (error) {
    console.error('✗ Error initializing database:', error);
    throw error;
  }
};

/**
 * Drop all tables (use with caution!)
 */
export const dropAllTables = async () => {
  try {
    console.log('Dropping all tables...');
    
    await query(`
      DROP TABLE IF EXISTS audit_log CASCADE;
      DROP TABLE IF EXISTS reminders CASCADE;
      DROP TABLE IF EXISTS budgets CASCADE;
      DROP TABLE IF EXISTS petty_expenses CASCADE;
      DROP TABLE IF EXISTS bills CASCADE;
      DROP TABLE IF EXISTS cash_transactions CASCADE;
      DROP TABLE IF EXISTS card_transactions CASCADE;
      DROP TABLE IF EXISTS cards CASCADE;
      DROP TABLE IF EXISTS salaries CASCADE;
      DROP TABLE IF EXISTS employees CASCADE;
      DROP TABLE IF EXISTS sessions CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      
      DROP VIEW IF EXISTS dashboard_summary CASCADE;
      DROP VIEW IF EXISTS monthly_expenses CASCADE;
      DROP VIEW IF EXISTS budget_utilization CASCADE;
      DROP VIEW IF EXISTS employee_salary_summary CASCADE;
      
      DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
      DROP FUNCTION IF EXISTS sync_card_is_active() CASCADE;
      DROP FUNCTION IF EXISTS create_audit_log() CASCADE;
      DROP FUNCTION IF EXISTS cleanup_expired_sessions() CASCADE;
      DROP FUNCTION IF EXISTS archive_old_audit_logs(INTEGER) CASCADE;
    `);
    
    console.log('✓ All tables dropped successfully');
  } catch (error) {
    console.error('✗ Error dropping tables:', error);
    throw error;
  }
};

/**
 * Reset database (drop and recreate)
 */
export const resetDatabase = async () => {
  await dropAllTables();
  await initializeDatabase();
};
