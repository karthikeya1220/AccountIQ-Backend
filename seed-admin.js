require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'accounting_db',
});

async function seedAdmin() {
  try {
    console.log('🌱 Seeding admin user...');

    const email = 'admin@accounting.com';
    const password = 'admin123'; // Change this in production!
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Admin user already exists. Updating password...');
      await pool.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
        [hashedPassword, email]
      );
      console.log('✅ Admin password updated!');
    } else {
      console.log('Creating new admin user...');
      await pool.query(
        `INSERT INTO users (email, password, first_name, last_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [email, hashedPassword, 'Admin', 'User', 'admin', true]
      );
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📧 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedAdmin();
