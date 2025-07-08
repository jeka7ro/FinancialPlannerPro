import { Pool } from 'pg';
import bcrypt from 'bcrypt';

// Database connection for Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/cashpot_gaming'
});

async function setupDatabase() {
  try {
    console.log('🔧 Setting up Render database...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Create admin user if it doesn't exist
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const userResult = await client.query(
      'SELECT COUNT(*) FROM users WHERE username = $1',
      ['admin']
    );
    
    if (parseInt(userResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO users (username, email, password, first_name, last_name, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `, ['admin', 'admin@example.com', adminPassword, 'Admin', 'User', 'admin']);
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
    
    // Create sample companies if they don't exist
    const companiesResult = await client.query('SELECT COUNT(*) FROM companies');
    if (parseInt(companiesResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO companies (name, email, phone, address, created_at, updated_at)
        VALUES 
          ('Company A', 'contact@companya.com', '+1234567890', '123 Main St', NOW(), NOW()),
          ('Company B', 'info@companyb.com', '+0987654321', '456 Oak Ave', NOW(), NOW()),
          ('Company C', 'hello@companyc.com', '+1122334455', '789 Pine Rd', NOW(), NOW())
      `);
      console.log('✅ Sample companies created');
    } else {
      console.log('ℹ️ Companies already exist');
    }
    
    // Create sample locations if they don't exist
    const locationsResult = await client.query('SELECT COUNT(*) FROM locations');
    if (parseInt(locationsResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO locations (name, address, city, country, created_at, updated_at)
        VALUES 
          ('Location A', '123 Main St', 'New York', 'USA', NOW(), NOW()),
          ('Location B', '456 Oak Ave', 'Los Angeles', 'USA', NOW(), NOW()),
          ('Location C', '789 Pine Rd', 'Chicago', 'USA', NOW(), NOW())
      `);
      console.log('✅ Sample locations created');
    } else {
      console.log('ℹ️ Locations already exist');
    }
    
    // Create sample providers if they don't exist
    const providersResult = await client.query('SELECT COUNT(*) FROM providers');
    if (parseInt(providersResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO providers (name, email, phone, address, created_at, updated_at)
        VALUES 
          ('Provider A', 'contact@providera.com', '+1234567890', '123 Provider St', NOW(), NOW()),
          ('Provider B', 'info@providerb.com', '+0987654321', '456 Provider Ave', NOW(), NOW()),
          ('Provider C', 'hello@providerc.com', '+1122334455', '789 Provider Rd', NOW(), NOW())
      `);
      console.log('✅ Sample providers created');
    } else {
      console.log('ℹ️ Providers already exist');
    }
    
    // Create sample cabinets if they don't exist
    const cabinetsResult = await client.query('SELECT COUNT(*) FROM cabinets');
    if (parseInt(cabinetsResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO cabinets (name, location_id, provider_id, status, created_at, updated_at)
        VALUES 
          ('Cabinet A', 1, 1, 'active', NOW(), NOW()),
          ('Cabinet B', 2, 2, 'active', NOW(), NOW()),
          ('Cabinet C', 3, 3, 'active', NOW(), NOW())
      `);
      console.log('✅ Sample cabinets created');
    } else {
      console.log('ℹ️ Cabinets already exist');
    }
    
    // Create sample game mixes if they don't exist
    const gameMixesResult = await client.query('SELECT COUNT(*) FROM game_mixes');
    if (parseInt(gameMixesResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO game_mixes (name, description, status, created_at, updated_at)
        VALUES 
          ('Mix A', 'Sample game mix A', 'active', NOW(), NOW()),
          ('Mix B', 'Sample game mix B', 'active', NOW(), NOW()),
          ('Mix C', 'Sample game mix C', 'active', NOW(), NOW())
      `);
      console.log('✅ Sample game mixes created');
    } else {
      console.log('ℹ️ Game mixes already exist');
    }
    
    // Create sample slots if they don't exist
    const slotsResult = await client.query('SELECT COUNT(*) FROM slots');
    if (parseInt(slotsResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO slots (name, cabinet_id, game_mix_id, status, created_at, updated_at)
        VALUES 
          ('Slot A', 1, 1, 'active', NOW(), NOW()),
          ('Slot B', 2, 2, 'active', NOW(), NOW()),
          ('Slot C', 3, 3, 'active', NOW(), NOW())
      `);
      console.log('✅ Sample slots created');
    } else {
      console.log('ℹ️ Slots already exist');
    }
    
    // Create sample invoices if they don't exist
    const invoicesResult = await client.query('SELECT COUNT(*) FROM invoices');
    if (parseInt(invoicesResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO invoices (number, company_id, amount, due_date, status, created_at, updated_at)
        VALUES 
          ('INV-001', 1, 1000.00, '2025-08-01', 'pending', NOW(), NOW()),
          ('INV-002', 2, 2000.00, '2025-08-15', 'paid', NOW(), NOW()),
          ('INV-003', 3, 1500.00, '2025-08-30', 'pending', NOW(), NOW())
      `);
      console.log('✅ Sample invoices created');
    } else {
      console.log('ℹ️ Invoices already exist');
    }
    
    // Create sample legal documents if they don't exist
    const legalDocsResult = await client.query('SELECT COUNT(*) FROM legal_documents');
    if (parseInt(legalDocsResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO legal_documents (title, content, status, created_at, updated_at)
        VALUES 
          ('Terms of Service', 'Sample terms of service content', 'active', NOW(), NOW()),
          ('Privacy Policy', 'Sample privacy policy content', 'active', NOW(), NOW()),
          ('License Agreement', 'Sample license agreement content', 'active', NOW(), NOW())
      `);
      console.log('✅ Sample legal documents created');
    } else {
      console.log('ℹ️ Legal documents already exist');
    }
    
    // Create sample rent agreements if they don't exist
    const rentAgreementsResult = await client.query('SELECT COUNT(*) FROM rent_agreements');
    if (parseInt(rentAgreementsResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO rent_agreements (company_id, location_id, start_date, end_date, amount, status, created_at, updated_at)
        VALUES 
          (1, 1, '2025-01-01', '2025-12-31', 5000.00, 'active', NOW(), NOW()),
          (2, 2, '2025-01-01', '2025-12-31', 6000.00, 'active', NOW(), NOW()),
          (3, 3, '2025-01-01', '2025-12-31', 4500.00, 'active', NOW(), NOW())
      `);
      console.log('✅ Sample rent agreements created');
    } else {
      console.log('ℹ️ Rent agreements already exist');
    }
    
    client.release();
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase(); 