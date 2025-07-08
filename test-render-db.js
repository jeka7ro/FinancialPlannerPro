import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Render DB');
    await client.query(`INSERT INTO companies (name, email, phone, address, created_at, updated_at) VALUES ('Test Company', 'test@company.com', '+400000000', 'Test Address', NOW(), NOW())`);
    console.log('✅ Inserted company');
    client.release();
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await pool.end();
  }
})(); 