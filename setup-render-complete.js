import { Pool } from 'pg';
import bcrypt from 'bcrypt';

// Database connection for Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/cashpot_gaming'
});

async function setupCompleteDatabase() {
  try {
    console.log('🚀 Setting up complete Render database with all relationships...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // 1. Create admin user if it doesn't exist
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
    
    // 2. Create sample companies if they don't exist
    const companiesResult = await client.query('SELECT COUNT(*) FROM companies');
    if (parseInt(companiesResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO companies (name, email, phone, address, created_at, updated_at)
        VALUES 
          ('CashPot Gaming', 'contact@cashpot.com', '+1234567890', '123 Gaming St, Las Vegas', NOW(), NOW()),
          ('Lucky Stars Casino', 'info@luckystars.com', '+0987654321', '456 Casino Ave, Atlantic City', NOW(), NOW()),
          ('Royal Gaming Corp', 'hello@royalgaming.com', '+1122334455', '789 Royal Rd, Reno', NOW(), NOW())
      `);
      console.log('✅ Sample companies created');
    } else {
      console.log('ℹ️ Companies already exist');
    }
    
    // 3. Create sample locations if they don't exist
    const locationsResult = await client.query('SELECT COUNT(*) FROM locations');
    if (parseInt(locationsResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO locations (name, address, city, country, created_at, updated_at)
        VALUES 
          ('Las Vegas Main', '123 Gaming St', 'Las Vegas', 'USA', NOW(), NOW()),
          ('Atlantic City Branch', '456 Casino Ave', 'Atlantic City', 'USA', NOW(), NOW()),
          ('Reno Center', '789 Royal Rd', 'Reno', 'USA', NOW(), NOW()),
          ('Miami Beach', '321 Ocean Dr', 'Miami', 'USA', NOW(), NOW()),
          ('Chicago Downtown', '654 Lake St', 'Chicago', 'USA', NOW(), NOW())
      `);
      console.log('✅ Sample locations created');
    } else {
      console.log('ℹ️ Locations already exist');
    }
    
    // 4. Create sample providers if they don't exist
    const providersResult = await client.query('SELECT COUNT(*) FROM providers');
    if (parseInt(providersResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO providers (name, email, phone, address, created_at, updated_at)
        VALUES 
          ('IGT Gaming', 'contact@igt.com', '+1234567890', '123 IGT St, Las Vegas', NOW(), NOW()),
          ('Scientific Games', 'info@sg.com', '+0987654321', '456 SG Ave, Reno', NOW(), NOW()),
          ('Aristocrat Technologies', 'hello@aristocrat.com', '+1122334455', '789 Aristocrat Rd, Sydney', NOW(), NOW()),
          ('Bally Technologies', 'contact@bally.com', '+1555666777', '321 Bally St, Las Vegas', NOW(), NOW()),
          ('Konami Gaming', 'info@konami.com', '+1888999000', '654 Konami Ave, Tokyo', NOW(), NOW())
      `);
      console.log('✅ Sample providers created');
    } else {
      console.log('ℹ️ Providers already exist');
    }
    
    // 5. Update locations with company IDs (associate locations with companies)
    console.log('🔗 Associating locations with companies...');
    await client.query(`
      UPDATE locations 
      SET company_id = 1 
      WHERE id IN (1, 4, 5)
    `);
    await client.query(`
      UPDATE locations 
      SET company_id = 2 
      WHERE id = 2
    `);
    await client.query(`
      UPDATE locations 
      SET company_id = 3 
      WHERE id = 3
    `);
    console.log('✅ Locations associated with companies');
    
    // 6. Associate users with locations
    console.log('🔗 Associating users with locations...');
    try {
      await client.query(`
        INSERT INTO user_locations (user_id, location_id, created_at, updated_at)
        VALUES 
          (1, 1, NOW(), NOW()),
          (1, 2, NOW(), NOW()),
          (1, 3, NOW(), NOW()),
          (1, 4, NOW(), NOW()),
          (1, 5, NOW(), NOW())
        ON CONFLICT (user_id, location_id) DO NOTHING
      `);
      console.log('✅ Users associated with locations');
    } catch (error) {
      console.log('ℹ️ User-location associations already exist or table structure different');
    }
    
    // 7. Create sample cabinets if they don't exist
    const cabinetsResult = await client.query('SELECT COUNT(*) FROM cabinets');
    if (parseInt(cabinetsResult.rows[0].count) === 0) {
      // Get provider IDs
      const providerIds = await client.query('SELECT id FROM providers ORDER BY id LIMIT 3');
      const locationIds = await client.query('SELECT id FROM locations ORDER BY id LIMIT 3');
      
      await client.query(`
        INSERT INTO cabinets (name, location_id, provider_id, status, created_at, updated_at)
        VALUES 
          ('IGT Slant Top A', $1, $2, 'active', NOW(), NOW()),
          ('Scientific Games B', $3, $4, 'active', NOW(), NOW()),
          ('Aristocrat C', $5, $6, 'active', NOW(), NOW()),
          ('Bally D', $1, $7, 'active', NOW(), NOW()),
          ('Konami E', $3, $8, 'active', NOW(), NOW())
      `, [
        locationIds.rows[0].id, providerIds.rows[0].id,
        locationIds.rows[1].id, providerIds.rows[1].id,
        locationIds.rows[2].id, providerIds.rows[2].id,
        providerIds.rows[0].id, providerIds.rows[1].id
      ]);
      console.log('✅ Sample cabinets created');
    } else {
      console.log('ℹ️ Cabinets already exist');
    }
    
    // 8. Create sample game mixes if they don't exist
    const gameMixesResult = await client.query('SELECT COUNT(*) FROM game_mixes');
    if (parseInt(gameMixesResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO game_mixes (name, description, status, created_at, updated_at)
        VALUES 
          ('Classic Slots Mix', 'Traditional slot games with classic themes', 'active', NOW(), NOW()),
          ('Video Slots Mix', 'Modern video slots with bonus features', 'active', NOW(), NOW()),
          ('Progressive Mix', 'Progressive jackpot games', 'active', NOW(), NOW()),
          ('Table Games Mix', 'Blackjack, poker, and other table games', 'active', NOW(), NOW()),
          ('Keno Mix', 'Keno and lottery-style games', 'active', NOW(), NOW())
      `);
      console.log('✅ Sample game mixes created');
    } else {
      console.log('ℹ️ Game mixes already exist');
    }
    
    // 9. Create sample slots if they don't exist
    const slotsResult = await client.query('SELECT COUNT(*) FROM slots');
    if (parseInt(slotsResult.rows[0].count) === 0) {
      // Get cabinet and game mix IDs
      const cabinetIds = await client.query('SELECT id FROM cabinets ORDER BY id LIMIT 3');
      const gameMixIds = await client.query('SELECT id FROM game_mixes ORDER BY id LIMIT 3');
      
      await client.query(`
        INSERT INTO slots (name, cabinet_id, game_mix_id, status, created_at, updated_at)
        VALUES 
          ('Slot Machine A1', $1, $2, 'active', NOW(), NOW()),
          ('Slot Machine B1', $3, $4, 'active', NOW(), NOW()),
          ('Slot Machine C1', $5, $6, 'active', NOW(), NOW()),
          ('Slot Machine A2', $1, $4, 'active', NOW(), NOW()),
          ('Slot Machine B2', $3, $6, 'active', NOW(), NOW())
      `, [
        cabinetIds.rows[0].id, gameMixIds.rows[0].id,
        cabinetIds.rows[1].id, gameMixIds.rows[1].id,
        cabinetIds.rows[2].id, gameMixIds.rows[2].id
      ]);
      console.log('✅ Sample slots created');
    } else {
      console.log('ℹ️ Slots already exist');
    }
    
    // 10. Create sample invoices if they don't exist
    const invoicesResult = await client.query('SELECT COUNT(*) FROM invoices');
    if (parseInt(invoicesResult.rows[0].count) === 0) {
      // Get actual company IDs
      const companyIds = await client.query('SELECT id FROM companies ORDER BY id LIMIT 3');
      
      if (companyIds.rows.length >= 3) {
        await client.query(`
          INSERT INTO invoices (invoice_number, company_id, invoice_date, due_date, subtotal, tax_amount, total_amount, status, created_at, updated_at)
          VALUES 
            ('INV-2025-001', $1, '2025-01-15', '2025-08-01', 15000.00, 2850.00, 17850.00, 'pending', NOW(), NOW()),
            ('INV-2025-002', $2, '2025-01-20', '2025-08-15', 25000.00, 4750.00, 29750.00, 'active', NOW(), NOW()),
            ('INV-2025-003', $3, '2025-01-25', '2025-08-30', 18000.00, 3420.00, 21420.00, 'pending', NOW(), NOW()),
            ('INV-2025-004', $1, '2025-02-01', '2025-09-01', 12000.00, 2280.00, 14280.00, 'pending', NOW(), NOW()),
            ('INV-2025-005', $2, '2025-02-05', '2025-09-15', 30000.00, 5700.00, 35700.00, 'pending', NOW(), NOW())
        `, [
          companyIds.rows[0].id,
          companyIds.rows[1].id,
          companyIds.rows[2].id
        ]);
        console.log('✅ Sample invoices created');
      } else {
        console.log('⚠️ Not enough companies found for invoices');
      }
    } else {
      console.log('ℹ️ Invoices already exist');
    }
    
    // 11. Create sample legal documents if they don't exist
    const legalDocsResult = await client.query('SELECT COUNT(*) FROM legal_documents');
    if (parseInt(legalDocsResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO legal_documents (title, document_type, description, status, created_at, updated_at)
        VALUES 
          ('Gaming License Agreement', 'License', 'Official gaming license terms and conditions for all locations', 'active', NOW(), NOW()),
          ('Privacy Policy', 'Policy', 'Customer data protection and privacy policy', 'active', NOW(), NOW()),
          ('Terms of Service', 'Terms', 'General terms of service for gaming operations', 'active', NOW(), NOW()),
          ('Employee Handbook', 'Handbook', 'Guidelines and policies for gaming employees', 'active', NOW(), NOW()),
          ('Safety Protocols', 'Protocol', 'Safety and security protocols for gaming facilities', 'active', NOW(), NOW())
      `);
      console.log('✅ Sample legal documents created');
    } else {
      console.log('ℹ️ Legal documents already exist');
    }
    
    // 12. Create sample rent agreements if they don't exist
    const rentAgreementsResult = await client.query('SELECT COUNT(*) FROM rent_agreements');
    if (parseInt(rentAgreementsResult.rows[0].count) === 0) {
      // Get actual company and location IDs
      const companyIds = await client.query('SELECT id FROM companies ORDER BY id LIMIT 3');
      const locationIds = await client.query('SELECT id FROM locations ORDER BY id LIMIT 5');
      
      if (companyIds.rows.length >= 3 && locationIds.rows.length >= 5) {
        await client.query(`
          INSERT INTO rent_agreements (agreement_number, company_id, location_id, start_date, end_date, monthly_rent, status, created_at, updated_at)
          VALUES 
            ('RENT-2025-001', $1, $4, '2025-01-01', '2025-12-31', 15000.00, 'active', NOW(), NOW()),
            ('RENT-2025-002', $2, $5, '2025-01-01', '2025-12-31', 18000.00, 'active', NOW(), NOW()),
            ('RENT-2025-003', $3, $6, '2025-01-01', '2025-12-31', 12000.00, 'active', NOW(), NOW()),
            ('RENT-2025-004', $1, $7, '2025-01-01', '2025-12-31', 14000.00, 'active', NOW(), NOW()),
            ('RENT-2025-005', $1, $8, '2025-01-01', '2025-12-31', 16000.00, 'active', NOW(), NOW())
        `, [
          companyIds.rows[0].id,
          companyIds.rows[1].id,
          companyIds.rows[2].id,
          locationIds.rows[0].id,
          locationIds.rows[1].id,
          locationIds.rows[2].id,
          locationIds.rows[3].id,
          locationIds.rows[4].id
        ]);
        console.log('✅ Sample rent agreements created');
      } else {
        console.log('⚠️ Not enough companies or locations found for rent agreements');
      }
    } else {
      console.log('ℹ️ Rent agreements already exist');
    }
    
    // 13. Verify all relationships
    console.log('🔍 Verifying database relationships...');
    
    const locationWithCompany = await client.query(`
      SELECT l.name as location_name, c.name as company_name 
      FROM locations l 
      LEFT JOIN companies c ON l.company_id = c.id 
      ORDER BY l.id LIMIT 5
    `);
    console.log('📍 Locations with companies:', locationWithCompany.rows);
    
    const cabinetWithLocation = await client.query(`
      SELECT cab.name as cabinet_name, l.name as location_name, p.name as provider_name
      FROM cabinets cab 
      LEFT JOIN locations l ON cab.location_id = l.id 
      LEFT JOIN providers p ON cab.provider_id = p.id 
      ORDER BY cab.id LIMIT 5
    `);
    console.log('🎰 Cabinets with locations and providers:', cabinetWithLocation.rows);
    
    const slotWithDetails = await client.query(`
      SELECT s.serial_nr as slot_serial, cab.name as cabinet_name, gm.name as game_mix_name
      FROM slots s 
      LEFT JOIN cabinets cab ON s.cabinet_id = cab.id 
      LEFT JOIN game_mixes gm ON s.game_mix_id = gm.id 
      ORDER BY s.id LIMIT 5
    `);
    console.log('🎮 Slots with cabinets and game mixes:', slotWithDetails.rows);
    
    client.release();
    console.log('🎉 Complete database setup finished successfully!');
    console.log('✅ All data is now saved online and accessible from anywhere');
    console.log('🌐 Your app is ready to use with persistent online storage');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupCompleteDatabase(); 