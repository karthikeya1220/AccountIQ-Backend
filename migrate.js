require('dotenv').config();

// Import the migration function directly without building
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'accounting_db',
});

const query = (text, params) => {
  return pool.query(text, params);
};

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database migration...');
    
    // Create users table
    console.log('Creating users table...');
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create employees table
    console.log('Creating employees table...');
    await query(`
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        designation VARCHAR(100),
        department_id UUID,
        base_salary DECIMAL(12, 2),
        join_date DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create cards table (before bills since bills references cards)
    console.log('Creating cards table...');
    await query(`
      CREATE TABLE IF NOT EXISTS cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        card_number VARCHAR(20) NOT NULL UNIQUE,
        card_holder VARCHAR(100) NOT NULL,
        card_type VARCHAR(50),
        bank VARCHAR(100),
        expiry_date DATE,
        card_limit DECIMAL(12, 2),
        balance DECIMAL(12, 2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create bills table
    console.log('Creating bills table...');
    await query(`
      CREATE TABLE IF NOT EXISTS bills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        bill_date DATE NOT NULL,
        vendor VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        description TEXT,
        category_id UUID,
        attachment_url VARCHAR(500),
        attachment_type VARCHAR(50),
        card_id UUID,
        status VARCHAR(50) DEFAULT 'pending',
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create cash transactions table
    console.log('Creating cash_transactions table...');
    await query(`
      CREATE TABLE IF NOT EXISTS cash_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_date DATE NOT NULL,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        transaction_type VARCHAR(50),
        category_id UUID,
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create salaries table
    console.log('Creating salaries table...');
    await query(`
      CREATE TABLE IF NOT EXISTS salaries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID REFERENCES employees(id),
        month DATE NOT NULL,
        base_salary DECIMAL(12, 2),
        allowances DECIMAL(12, 2) DEFAULT 0,
        deductions DECIMAL(12, 2) DEFAULT 0,
        net_salary DECIMAL(12, 2),
        status VARCHAR(50) DEFAULT 'pending',
        paid_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create petty expenses table
    console.log('Creating petty_expenses table...');
    await query(`
      CREATE TABLE IF NOT EXISTS petty_expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        category_id UUID,
        expense_date DATE NOT NULL,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create reminders table
    console.log('Creating reminders table...');
    await query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        reminder_date DATE NOT NULL,
        reminder_time TIME,
        type VARCHAR(50),
        related_id UUID,
        notification_methods TEXT[],
        recipients TEXT[],
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create budgets table
    console.log('Creating budgets table...');
    await query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_id UUID,
        category_name VARCHAR(100),
        budget_limit DECIMAL(12, 2) NOT NULL,
        spent DECIMAL(12, 2) DEFAULT 0,
        period VARCHAR(50),
        month DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table
    console.log('Creating sessions table...');
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL,
        refresh_token VARCHAR(500),
        ip_address VARCHAR(50),
        user_agent TEXT,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Create an admin user with: node seed-admin.js');
    console.log('2. Start the backend server with: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
