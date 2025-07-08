import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://cashpot_gaming_user:password@dpg-cp8j8v6n7h1c73f8v8q0-a.oregon-postgres.render.com/cashpot_gaming',
  ssl: { rejectUnauthorized: false }
});

async function populateRenderDB() {
  try {
    console.log('🔌 Connecting to Render database...');
    const client = await pool.connect();
    console.log('✅ Connected to Render DB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await client.query('DELETE FROM cabinets');
    await client.query('DELETE FROM game_mixes');
    await client.query('DELETE FROM slots');
    await client.query('DELETE FROM invoices');
    await client.query('DELETE FROM legal_documents');
    await client.query('DELETE FROM rent_agreements');
    await client.query('DELETE FROM locations');
    await client.query('DELETE FROM companies');
    await client.query('DELETE FROM providers');
    await client.query('DELETE FROM users WHERE username != \'admin\'');
    console.log('✅ Data cleared');

    // Insert providers first
    console.log('📦 Inserting providers...');
    await client.query(`
      INSERT INTO providers (name, email, phone, address, created_at, updated_at) VALUES 
      ('Provider A', 'contact@providera.com', '+1234567890', '123 Provider St', NOW(), NOW()),
      ('Provider B', 'info@providerb.com', '+0987654321', '456 Provider Ave', NOW(), NOW())
    `);
    console.log('✅ Providers inserted');

    // Insert companies
    console.log('🏢 Inserting companies...');
    await client.query(`
      INSERT INTO companies (name, email, phone, address, created_at, updated_at) VALUES 
      ('Company A', 'contact@companya.com', '+1234567890', '123 Main St', NOW(), NOW()),
      ('Company B', 'info@companyb.com', '+0987654321', '456 Oak Ave', NOW(), NOW()),
      ('Company C', 'hello@companyc.com', '+1122334455', '789 Pine Rd', NOW(), NOW())
    `);
    console.log('✅ Companies inserted');

    // Insert locations
    console.log('📍 Inserting locations...');
    await client.query(`
      INSERT INTO locations (name, address, city, state, country, postal_code, latitude, longitude, created_at, updated_at) VALUES 
      ('Location A', '123 Main St', 'Bucharest', 'Bucharest', 'Romania', '010000', 44.4268, 26.1025, NOW(), NOW()),
      ('Location B', '456 Oak Ave', 'Cluj', 'Cluj', 'Romania', '400000', 46.7712, 23.6236, NOW(), NOW())
    `);
    console.log('✅ Locations inserted');

    // Insert cabinets
    console.log('🗄️ Inserting cabinets...');
    await client.query(`
      INSERT INTO cabinets (serial_number, model, provider_id, location_id, status, created_at, updated_at) VALUES 
      ('CAB001', 'Model A', 1, 1, 'active', NOW(), NOW()),
      ('CAB002', 'Model B', 2, 2, 'active', NOW(), NOW())
    `);
    console.log('✅ Cabinets inserted');

    // Insert game mixes
    console.log('🎮 Inserting game mixes...');
    await client.query(`
      INSERT INTO game_mixes (name, description, created_at, updated_at) VALUES 
      ('Mix A', 'Popular games mix', NOW(), NOW()),
      ('Mix B', 'Premium games mix', NOW(), NOW())
    `);
    console.log('✅ Game mixes inserted');

    // Insert slots
    console.log('🎰 Inserting slots...');
    await client.query(`
      INSERT INTO slots (name, cabinet_id, game_mix_id, status, created_at, updated_at) VALUES 
      ('Slot 1', 1, 1, 'active', NOW(), NOW()),
      ('Slot 2', 2, 2, 'active', NOW(), NOW())
    `);
    console.log('✅ Slots inserted');

    // Insert invoices
    console.log('🧾 Inserting invoices...');
    await client.query(`
      INSERT INTO invoices (invoice_number, company_id, amount, status, due_date, created_at, updated_at) VALUES 
      ('INV001', 1, 1000.00, 'paid', NOW() + INTERVAL '30 days', NOW(), NOW()),
      ('INV002', 2, 1500.00, 'pending', NOW() + INTERVAL '30 days', NOW(), NOW())
    `);
    console.log('✅ Invoices inserted');

    // Insert legal documents
    console.log('📄 Inserting legal documents...');
    await client.query(`
      INSERT INTO legal_documents (title, document_type, file_path, created_at, updated_at) VALUES 
      ('Contract A', 'contract', '/documents/contract-a.pdf', NOW(), NOW()),
      ('License B', 'license', '/documents/license-b.pdf', NOW(), NOW())
    `);
    console.log('✅ Legal documents inserted');

    // Insert rent agreements
    console.log('🏠 Inserting rent agreements...');
    await client.query(`
      INSERT INTO rent_agreements (location_id, start_date, end_date, monthly_rent, status, created_at, updated_at) VALUES 
      (1, NOW(), NOW() + INTERVAL '1 year', 500.00, 'active', NOW(), NOW()),
      (2, NOW(), NOW() + INTERVAL '1 year', 750.00, 'active', NOW(), NOW())
    `);
    console.log('✅ Rent agreements inserted');

    client.release();
    console.log('🎉 Database populated successfully!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

populateRenderDB(); 