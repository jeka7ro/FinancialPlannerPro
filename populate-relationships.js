import { Pool } from 'pg';
import bcrypt from 'bcrypt';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/cashpot_gaming'
});

async function populateRelationships() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Starting to populate relationships...');
    
    // 1. Update locations to associate them with companies
    console.log('📍 Associating locations with companies...');
    await client.query(`
      UPDATE locations 
      SET company_id = CASE 
        WHEN id = 10 THEN 11  -- Location A -> Company A
        WHEN id = 11 THEN 12  -- Location B -> Company B  
        WHEN id = 12 THEN 13  -- Location C -> Company C
        ELSE company_id
      END
      WHERE id IN (10, 11, 12)
    `);
    
    // 2. Clear existing user-location associations and create new ones
    console.log('👤 Associating users with locations...');
    await client.query('DELETE FROM user_locations WHERE user_id = 1');
    await client.query(`
      INSERT INTO user_locations (user_id, location_id) 
      VALUES 
        (1, 10),  -- Admin -> Location A
        (1, 11),  -- Admin -> Location B
        (1, 12)   -- Admin -> Location C
    `);
    
    // 3. Update locations to have managers
    console.log('👨‍💼 Setting location managers...');
    await client.query(`
      UPDATE locations 
      SET manager_id = 1  -- Set admin as manager for all locations
      WHERE id IN (10, 11, 12)
    `);
    
    // 4. Create additional sample users if needed
    console.log('👥 Creating additional sample users...');
    const hashedPassword = await bcrypt.hash('user123', 10);
    
    // Check if users already exist
    const existingUsers = await client.query(`
      SELECT username FROM users WHERE username IN ('manager1', 'operator1')
    `);
    
    const existingUsernames = existingUsers.rows.map(row => row.username);
    
    if (!existingUsernames.includes('manager1')) {
      await client.query(`
        INSERT INTO users (username, email, password, first_name, last_name, role, created_at, updated_at)
        VALUES ('manager1', 'manager1@example.com', $1, 'John', 'Manager', 'user', NOW(), NOW())
      `, [hashedPassword]);
    }
    
    if (!existingUsernames.includes('operator1')) {
      await client.query(`
        INSERT INTO users (username, email, password, first_name, last_name, role, created_at, updated_at)
        VALUES ('operator1', 'operator1@example.com', $1, 'Jane', 'Operator', 'user', NOW(), NOW())
      `, [hashedPassword]);
    }
    
    // 5. Associate new users with locations
    console.log('🔗 Associating new users with locations...');
    const newUsers = await client.query(`
      SELECT id FROM users WHERE username IN ('manager1', 'operator1')
    `);
    
    for (const user of newUsers.rows) {
      await client.query('DELETE FROM user_locations WHERE user_id = $1', [user.id]);
      await client.query(`
        INSERT INTO user_locations (user_id, location_id) 
        VALUES ($1, 10), ($1, 11), ($1, 12)
      `, [user.id]);
    }
    
    // 6. Create some sample providers
    console.log('🏢 Creating sample providers...');
    try {
      await client.query(`
        INSERT INTO providers (name, company_name, contact_person, email, phone, address, city, country, is_active, created_at, updated_at)
        VALUES 
          ('Provider Alpha', 'Alpha Gaming Ltd', 'Contact Person', 'contact@alpha.com', '+1234567890', '123 Provider St', 'Bucharest', 'Romania', true, NOW(), NOW()),
          ('Provider Beta', 'Beta Entertainment', 'Manager', 'info@beta.com', '+0987654321', '456 Gaming Ave', 'Cluj', 'Romania', true, NOW(), NOW()),
          ('Provider Gamma', 'Gamma Systems', 'Director', 'hello@gamma.com', '+1122334455', '789 Tech Rd', 'Timisoara', 'Romania', true, NOW(), NOW())
      `);
      console.log('✅ Providers created successfully');
    } catch (error) {
      console.error('❌ Error creating providers:', error.message);
      // Check if providers already exist
      const existingProviders = await client.query('SELECT id, name FROM providers LIMIT 5');
      console.log('Existing providers:', existingProviders.rows);
    }
    
    // Get provider IDs for cabinet creation
    const providers = await client.query('SELECT id FROM providers LIMIT 3');
    const providerIds = providers.rows.map(p => p.id);
    
    if (providerIds.length === 0) {
      console.log('⚠️ No providers found, skipping cabinet creation');
      return;
    }
    
    // 7. Create some sample cabinets
    console.log('🎰 Creating sample cabinets...');
    try {
      await client.query(`
        INSERT INTO cabinets (name, serial_number, model, manufacturer, provider_id, location_id, status, is_active, created_at, updated_at)
        VALUES 
          ('Cabinet Alpha-1', 'ALP001', 'Gaming Station Pro', 'Alpha Gaming', $1, 10, 'active', true, NOW(), NOW()),
          ('Cabinet Beta-1', 'BET001', 'Entertainment Elite', 'Beta Entertainment', $2, 11, 'active', true, NOW(), NOW()),
          ('Cabinet Gamma-1', 'GAM001', 'Tech Master', 'Gamma Systems', $3, 12, 'active', true, NOW(), NOW())
      `, [providerIds[0] || 1, providerIds[1] || 1, providerIds[2] || 1]);
      console.log('✅ Cabinets created successfully');
    } catch (error) {
      console.error('❌ Error creating cabinets:', error.message);
    }
    
    // 8. Create some sample game mixes
    console.log('🎮 Creating sample game mixes...');
    try {
      await client.query(`
        INSERT INTO game_mixes (name, description, provider_id, is_active, created_at, updated_at)
        VALUES 
          ('Classic Mix', 'Classic slot games collection', $1, true, NOW(), NOW()),
          ('Modern Mix', 'Modern video slot games', $2, true, NOW(), NOW()),
          ('Premium Mix', 'Premium high-stakes games', $3, true, NOW(), NOW())
      `, [providerIds[0] || 1, providerIds[1] || 1, providerIds[2] || 1]);
      console.log('✅ Game mixes created successfully');
    } catch (error) {
      console.error('❌ Error creating game mixes:', error.message);
    }
    
    // 9. Create some sample slots
    console.log('🎯 Creating sample slots...');
    try {
      // Get cabinet IDs
      const cabinets = await client.query('SELECT id FROM cabinets LIMIT 3');
      const cabinetIds = cabinets.rows.map(c => c.id);
      
      // Get game mix IDs
      const gameMixes = await client.query('SELECT id FROM game_mixes LIMIT 3');
      const gameMixIds = gameMixes.rows.map(g => g.id);
      
      if (cabinetIds.length > 0 && gameMixIds.length > 0) {
        await client.query(`
          INSERT INTO slots (cabinet_id, game_mix_id, provider_id, location_id, denomination, max_bet, rtp, property_type, owner_id, is_active, created_at, updated_at)
          VALUES 
            ($1, $4, $7, 10, 0.01, 100.00, 96.50, 'property', 11, true, NOW(), NOW()),
            ($2, $5, $8, 11, 0.05, 500.00, 95.80, 'property', 12, true, NOW(), NOW()),
            ($3, $6, $9, 12, 0.10, 1000.00, 97.20, 'property', 13, true, NOW(), NOW())
        `, [
          cabinetIds[0] || 1, cabinetIds[1] || 1, cabinetIds[2] || 1,
          gameMixIds[0] || 1, gameMixIds[1] || 1, gameMixIds[2] || 1,
          providerIds[0] || 1, providerIds[1] || 1, providerIds[2] || 1
        ]);
        console.log('✅ Slots created successfully');
      } else {
        console.log('⚠️ No cabinets or game mixes found, skipping slot creation');
      }
    } catch (error) {
      console.error('❌ Error creating slots:', error.message);
    }
    
    console.log('✅ Relationships populated successfully!');
    
    // 10. Display summary
    const summary = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM companies) as companies_count,
        (SELECT COUNT(*) FROM locations) as locations_count,
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM user_locations) as user_locations_count,
        (SELECT COUNT(*) FROM providers) as providers_count,
        (SELECT COUNT(*) FROM cabinets) as cabinets_count,
        (SELECT COUNT(*) FROM game_mixes) as game_mixes_count,
        (SELECT COUNT(*) FROM slots) as slots_count
    `);
    
    console.log('\n📊 Database Summary:');
    console.log(`Companies: ${summary.rows[0].companies_count}`);
    console.log(`Locations: ${summary.rows[0].locations_count}`);
    console.log(`Users: ${summary.rows[0].users_count}`);
    console.log(`User-Location Associations: ${summary.rows[0].user_locations_count}`);
    console.log(`Providers: ${summary.rows[0].providers_count}`);
    console.log(`Cabinets: ${summary.rows[0].cabinets_count}`);
    console.log(`Game Mixes: ${summary.rows[0].game_mixes_count}`);
    console.log(`Slots: ${summary.rows[0].slots_count}`);
    
  } catch (error) {
    console.error('❌ Error populating relationships:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the script
populateRelationships()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 