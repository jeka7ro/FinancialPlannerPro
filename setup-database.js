import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function setupDatabase() {
  try {
    console.log('🔄 Running database migrations...');
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('✅ Migrations completed');

    console.log('🔄 Setting up admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if admin user exists
    const existingUser = await db.execute(`
      SELECT id FROM users WHERE username = 'admin'
    `);

    if (existingUser.rows.length === 0) {
      await db.execute(`
        INSERT INTO users (username, email, password, first_name, last_name, role, created_at, updated_at)
        VALUES ('admin', 'admin@example.com', $1, 'Admin', 'User', 'admin', NOW(), NOW())
      `, [hashedPassword]);
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDatabase(); 