import { Pool } from 'pg';

// Test rapid conexiune și inserare simplă
async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    const client = await pool.connect();
    console.log('✅ Test: Connected to Render DB');
    await client.query(`INSERT INTO companies (name, email, phone, address, created_at, updated_at) VALUES ('Test Company', 'test@company.com', '+400000000', 'Test Address', NOW(), NOW())`);
    console.log('✅ Test: Inserted company');
    client.release();
  } catch (err) {
    console.error('❌ Test: Error connecting/inserting:', err);
  } finally {
    await pool.end();
  }
}

if (process.env.TEST_ONLY === '1') {
  testConnection();
  process.exit(0);
}

// Database connection for Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/cashpot_gaming',
  ssl: {
    rejectUnauthorized: false
  }
});

async function populateDatabase() {
  try {
    console.log('🔧 Populating Render database...');
    
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Clear existing data (except users)
    await client.query('DELETE FROM rent_agreements');
    await client.query('DELETE FROM invoices');
    await client.query('DELETE FROM slots');
    await client.query('DELETE FROM cabinets');
    await client.query('DELETE FROM game_mixes');
    await client.query('DELETE FROM legal_documents');
    await client.query('DELETE FROM locations');
    await client.query('DELETE FROM providers');
    await client.query('DELETE FROM companies');
    
    console.log('🧹 Cleared existing data');
    
    // Create sample companies
    await client.query(`
      INSERT INTO companies (name, email, phone, address, created_at, updated_at)
      VALUES 
        ('Company A', 'contact@companya.com', '+1234567890', '123 Main St', NOW(), NOW()),
        ('Company B', 'info@companyb.com', '+0987654321', '456 Oak Ave', NOW(), NOW()),
        ('Company C', 'hello@companyc.com', '+1122334455', '789 Pine Rd', NOW(), NOW())
    `);
    console.log('✅ Added companies');
    
    // Create sample locations
    await client.query(`
      INSERT INTO locations (name, address, city, country, created_at, updated_at)
      VALUES 
        ('Location A', '123 Main St', 'New York', 'USA', NOW(), NOW()),
        ('Location B', '456 Oak Ave', 'Los Angeles', 'USA', NOW(), NOW()),
        ('Location C', '789 Pine Rd', 'Chicago', 'USA', NOW(), NOW())
    `);
    console.log('✅ Added locations');
    
    // Create sample providers
    await client.query(`
      INSERT INTO providers (name, email, phone, address, created_at, updated_at)
      VALUES 
        ('Provider A', 'contact@providera.com', '+1234567890', '123 Provider St', NOW(), NOW()),
        ('Provider B', 'info@providerb.com', '+0987654321', '456 Provider Ave', NOW(), NOW()),
        ('Provider C', 'hello@providerc.com', '+1122334455', '789 Provider Rd', NOW(), NOW())
    `);
    console.log('✅ Added providers');
    
    // Create sample cabinets
    await client.query(`
      INSERT INTO cabinets (name, model, location_id, provider_id, status, created_at, updated_at)
      VALUES 
        ('Cabinet A', 'Model A', 1, 1, 'active', NOW(), NOW()),
        ('Cabinet B', 'Model B', 2, 2, 'active', NOW(), NOW()),
        ('Cabinet C', 'Model C', 3, 3, 'active', NOW(), NOW())
    `);
    console.log('✅ Added cabinets');
    
    // Create sample game mixes
    await client.query(`
      INSERT INTO game_mixes (name, description, status, created_at, updated_at)
      VALUES 
        ('Mix A', 'Sample game mix A', 'active', NOW(), NOW()),
        ('Mix B', 'Sample game mix B', 'active', NOW(), NOW()),
        ('Mix C', 'Sample game mix C', 'active', NOW(), NOW())
    `);
    console.log('✅ Added game mixes');
    
    // Create sample slots
    await client.query(`
      INSERT INTO slots (name, cabinet_id, game_mix_id, status, created_at, updated_at)
      VALUES 
        ('Slot A', 1, 1, 'active', NOW(), NOW()),
        ('Slot B', 2, 2, 'active', NOW(), NOW()),
        ('Slot C', 3, 3, 'active', NOW(), NOW())
    `);
    console.log('✅ Added slots');
    
    // Create sample invoices
    await client.query(`
      INSERT INTO invoices (number, company_id, amount, due_date, status, created_at, updated_at)
      VALUES 
        ('INV-001', 1, 1000.00, '2025-08-01', 'pending', NOW(), NOW()),
        ('INV-002', 2, 2000.00, '2025-08-15', 'paid', NOW(), NOW()),
        ('INV-003', 3, 1500.00, '2025-08-30', 'pending', NOW(), NOW())
    `);
    console.log('✅ Added invoices');
    
    // Create sample legal documents
    await client.query(`
      INSERT INTO legal_documents (title, content, status, created_at, updated_at)
      VALUES 
        ('Terms of Service', 'Sample terms of service content', 'active', NOW(), NOW()),
        ('Privacy Policy', 'Sample privacy policy content', 'active', NOW(), NOW()),
        ('License Agreement', 'Sample license agreement content', 'active', NOW(), NOW())
    `);
    console.log('✅ Added legal documents');
    
    // Create sample rent agreements
    await client.query(`
      INSERT INTO rent_agreements (company_id, location_id, start_date, end_date, amount, status, created_at, updated_at)
      VALUES 
        (1, 1, '2025-01-01', '2025-12-31', 5000.00, 'active', NOW(), NOW()),
        (2, 2, '2025-01-01', '2025-12-31', 6000.00, 'active', NOW(), NOW()),
        (3, 3, '2025-01-01', '2025-12-31', 4500.00, 'active', NOW(), NOW())
    `);
    console.log('✅ Added rent agreements');
    
    client.release();
    console.log('🎉 Database populated successfully!');
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    await pool.end();
  }
}

populateDatabase(); 