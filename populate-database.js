import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function populateDatabase() {
  try {
    console.log('🔄 Populating database with sample data...');

    // Create admin user if not exists
    const adminExists = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        `INSERT INTO users (username, email, password, first_name, last_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['admin', 'admin@example.com', hashedPassword, 'Admin', 'User', 'admin', true]
      );
      console.log('✅ Admin user created');
    }

    // Sample companies
    const companies = [
      {
        name: 'Gaming Solutions SRL',
        email: 'contact@gamingsolutions.ro',
        phone: '+40 21 123 4567',
        address: 'Strada Gaming 123, Sector 1',
        city: 'București',
        country: 'România',
        registration_number: 'RO12345678',
        tax_id: 'RO12345678',
        website: 'https://gamingsolutions.ro',
        contact_person: 'Ion Popescu'
      },
      {
        name: 'Digital Entertainment Ltd',
        email: 'info@digitalentertainment.com',
        phone: '+40 31 987 6543',
        address: 'Bulevardul Digital 456, Sector 2',
        city: 'București',
        country: 'România',
        registration_number: 'RO87654321',
        tax_id: 'RO87654321',
        website: 'https://digitalentertainment.com',
        contact_person: 'Maria Ionescu'
      },
      {
        name: 'Arcade Masters',
        email: 'hello@arcademasters.ro',
        phone: '+40 26 555 1234',
        address: 'Strada Arcade 789, Centru',
        city: 'Cluj-Napoca',
        country: 'România',
        registration_number: 'RO55512345',
        tax_id: 'RO55512345',
        website: 'https://arcademasters.ro',
        contact_person: 'Alexandru Dumitrescu'
      }
    ];

    for (const company of companies) {
      const exists = await pool.query('SELECT id FROM companies WHERE name = $1', [company.name]);
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO companies (name, email, phone, address, city, country, registration_number, tax_id, website, contact_person, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [company.name, company.email, company.phone, company.address, company.city, company.country, 
           company.registration_number, company.tax_id, company.website, company.contact_person, 'active']
        );
        console.log(`✅ Company created: ${company.name}`);
      }
    }

    // Sample locations
    const locations = [
      {
        name: 'Mall Băneasa Gaming Zone',
        address: 'Șoseaua București-Ploiești 42D',
        city: 'București',
        country: 'România',
        phone: '+40 21 123 4567',
        email: 'banesa@gamingsolutions.ro'
      },
      {
        name: 'AFI Palace Cotroceni Arcade',
        address: 'Bulevardul Vasile Milea 4',
        city: 'București',
        country: 'România',
        phone: '+40 21 234 5678',
        email: 'cotroceni@gamingsolutions.ro'
      },
      {
        name: 'Iulius Mall Timișoara Gaming',
        address: 'Strada Aristide Demetriade 1',
        city: 'Timișoara',
        country: 'România',
        phone: '+40 25 678 9012',
        email: 'timisoara@digitalentertainment.com'
      },
      {
        name: 'Iulius Mall Cluj Gaming Center',
        address: 'Strada Vâlcele 1-3',
        city: 'Cluj-Napoca',
        country: 'România',
        phone: '+40 26 456 7890',
        email: 'cluj@arcademasters.ro'
      }
    ];

    for (const location of locations) {
      const exists = await pool.query('SELECT id FROM locations WHERE name = $1', [location.name]);
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO locations (name, address, city, country, phone, email, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [location.name, location.address, location.city, location.country, 
           location.phone, location.email, 'active']
        );
        console.log(`✅ Location created: ${location.name}`);
      }
    }

    // Sample providers
    const providers = [
      {
        name: 'Novomatic Gaming',
        email: 'contact@novomatic.com',
        phone: '+43 1 234 5678',
        address: 'Industriestraße 6-8, 2355 Wiener Neudorf, Austria'
      },
      {
        name: 'IGT International',
        email: 'info@igt.com',
        phone: '+1 702 669 7777',
        address: '9295 Prototype Court, Reno, NV 89521, USA'
      },
      {
        name: 'Scientific Games',
        email: 'contact@sgc.com',
        phone: '+1 702 532 7000',
        address: '6601 Bermuda Road, Las Vegas, NV 89119, USA'
      }
    ];

    for (const provider of providers) {
      const exists = await pool.query('SELECT id FROM providers WHERE name = $1', [provider.name]);
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO providers (name, email, phone, address, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [provider.name, provider.email, provider.phone, provider.address, 'active']
        );
        console.log(`✅ Provider created: ${provider.name}`);
      }
    }

    // Sample game mixes
    const gameMixes = [
      {
        name: 'Classic Slots Mix',
        description: 'Traditional slot machines with classic themes'
      },
      {
        name: 'Video Slots Premium',
        description: 'Modern video slots with advanced graphics and features'
      },
      {
        name: 'Progressive Jackpot Collection',
        description: 'High-stakes progressive jackpot games'
      },
      {
        name: 'Table Games Mix',
        description: 'Classic table games like blackjack, roulette, and poker'
      }
    ];

    for (const gameMix of gameMixes) {
      const exists = await pool.query('SELECT id FROM game_mixes WHERE name = $1', [gameMix.name]);
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO game_mixes (name, description, status)
           VALUES ($1, $2, $3)`,
          [gameMix.name, gameMix.description, 'active']
        );
        console.log(`✅ Game mix created: ${gameMix.name}`);
      }
    }

    // Sample cabinets (need to get location and provider IDs)
    const cabinetData = [
      {
        name: 'Novomatic Diamond Line 1.2',
        model: 'Diamond Line 1.2',
        manufacturer: 'Novomatic',
        serial_number: 'NOV-DL-001',
        location_name: 'Mall Băneasa Gaming Zone',
        provider_name: 'Novomatic Gaming'
      },
      {
        name: 'IGT S2000',
        model: 'S2000',
        manufacturer: 'IGT',
        serial_number: 'IGT-S2K-001',
        location_name: 'AFI Palace Cotroceni Arcade',
        provider_name: 'IGT International'
      },
      {
        name: 'Scientific Games Pro Wave',
        model: 'Pro Wave',
        manufacturer: 'Scientific Games',
        serial_number: 'SG-PW-001',
        location_name: 'Iulius Mall Timișoara Gaming',
        provider_name: 'Scientific Games'
      }
    ];

    for (const cabinet of cabinetData) {
      const exists = await pool.query('SELECT id FROM cabinets WHERE serial_number = $1', [cabinet.serial_number]);
      if (exists.rows.length === 0) {
        const location = await pool.query('SELECT id FROM locations WHERE name = $1', [cabinet.location_name]);
        const provider = await pool.query('SELECT id FROM providers WHERE name = $1', [cabinet.provider_name]);
        
        if (location.rows.length > 0 && provider.rows.length > 0) {
          await pool.query(
            `INSERT INTO cabinets (name, model, manufacturer, serial_number, location_id, provider_id, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [cabinet.name, cabinet.model, cabinet.manufacturer, cabinet.serial_number, location.rows[0].id, provider.rows[0].id, 'active']
          );
          console.log(`✅ Cabinet created: ${cabinet.name}`);
        }
      }
    }

    // Sample slots (need to get cabinet and game mix IDs)
    const slotData = [
      {
        model: 'Book of Ra',
        serial_nr: 'NOV-SLOT-001',
        cabinet_serial: 'NOV-DL-001',
        game_mix_name: 'Classic Slots Mix'
      },
      {
        model: "Lucky Lady's Charm",
        serial_nr: 'NOV-SLOT-002',
        cabinet_serial: 'NOV-DL-001',
        game_mix_name: 'Classic Slots Mix'
      },
      {
        model: 'Wheel of Fortune',
        serial_nr: 'IGT-SLOT-001',
        cabinet_serial: 'IGT-S2K-001',
        game_mix_name: 'Video Slots Premium'
      }
    ];

    for (const slot of slotData) {
      const exists = await pool.query('SELECT id FROM slots WHERE serial_nr = $1', [slot.serial_nr]);
      if (exists.rows.length === 0) {
        const cabinet = await pool.query('SELECT id FROM cabinets WHERE serial_number = $1', [slot.cabinet_serial]);
        const gameMix = await pool.query('SELECT id FROM game_mixes WHERE name = $1', [slot.game_mix_name]);
        
        if (cabinet.rows.length > 0 && gameMix.rows.length > 0) {
          await pool.query(
            `INSERT INTO slots (model, serial_nr, cabinet_id, game_mix_id, status)
             VALUES ($1, $2, $3, $4, $5)`,
            [slot.model, slot.serial_nr, cabinet.rows[0].id, gameMix.rows[0].id, 'active']
          );
          console.log(`✅ Slot created: ${slot.model}`);
        }
      }
    }

    // Sample invoices
    const invoiceData = [
      {
        invoice_number: 'INV-2024-001',
        company_name: 'Gaming Solutions SRL',
        invoice_date: '2024-02-01',
        due_date: '2024-02-15',
        subtotal: 4200.00,
        tax_amount: 800.00,
        total_amount: 5000.00
      },
      {
        invoice_number: 'INV-2024-002',
        company_name: 'Digital Entertainment Ltd',
        invoice_date: '2024-02-05',
        due_date: '2024-02-20',
        subtotal: 6300.00,
        tax_amount: 1200.00,
        total_amount: 7500.00
      }
    ];

    for (const invoice of invoiceData) {
      const exists = await pool.query('SELECT id FROM invoices WHERE invoice_number = $1', [invoice.invoice_number]);
      if (exists.rows.length === 0) {
        const company = await pool.query('SELECT id FROM companies WHERE name = $1', [invoice.company_name]);
        
        if (company.rows.length > 0) {
          await pool.query(
            `INSERT INTO invoices (invoice_number, company_id, invoice_date, due_date, subtotal, tax_amount, total_amount, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)` ,
            [invoice.invoice_number, company.rows[0].id, invoice.invoice_date, invoice.due_date, invoice.subtotal, invoice.tax_amount, invoice.total_amount, 'pending']
          );
          console.log(`✅ Invoice created: ${invoice.invoice_number}`);
        }
      }
    }

    // Sample legal documents
    const legalDocs = [
      {
        title: 'Gaming License Agreement',
        description: 'Standard gaming license agreement for slot machine operations in Romania.'
      },
      {
        title: 'Data Protection Policy',
        description: 'Privacy policy and data protection measures for gaming operations.'
      },
      {
        title: 'Responsible Gaming Policy',
        description: 'Guidelines for responsible gaming and player protection.'
      }
    ];

    for (const doc of legalDocs) {
      const exists = await pool.query('SELECT id FROM legal_documents WHERE title = $1', [doc.title]);
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO legal_documents (title, description, status)
           VALUES ($1, $2, $3)`,
          [doc.title, doc.description, 'active']
        );
        console.log(`✅ Legal document created: ${doc.title}`);
      }
    }

    // Sample rent agreements
    const rentData = [
      {
        agreement_number: 'RA-2024-001',
        company_name: 'Gaming Solutions SRL',
        location_name: 'Mall Băneasa Gaming Zone',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        monthly_rent: 1000.00
      },
      {
        agreement_number: 'RA-2024-002',
        company_name: 'Digital Entertainment Ltd',
        location_name: 'AFI Palace Cotroceni Arcade',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        monthly_rent: 1250.00
      }
    ];

    for (const rent of rentData) {
      const company = await pool.query('SELECT id FROM companies WHERE name = $1', [rent.company_name]);
      const location = await pool.query('SELECT id FROM locations WHERE name = $1', [rent.location_name]);
      
      if (company.rows.length > 0 && location.rows.length > 0) {
        const exists = await pool.query(
          'SELECT id FROM rent_agreements WHERE agreement_number = $1',
          [rent.agreement_number]
        );
        
        if (exists.rows.length === 0) {
          await pool.query(
            `INSERT INTO rent_agreements (agreement_number, company_id, location_id, start_date, end_date, monthly_rent, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [rent.agreement_number, company.rows[0].id, location.rows[0].id, rent.start_date, rent.end_date, rent.monthly_rent, 'active']
          );
          console.log(`✅ Rent agreement created: ${rent.agreement_number}`);
        }
      }
    }

    console.log('✅ Database population completed successfully!');
    
    // Show summary
    const counts = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM companies'),
      pool.query('SELECT COUNT(*) FROM locations'),
      pool.query('SELECT COUNT(*) FROM providers'),
      pool.query('SELECT COUNT(*) FROM game_mixes'),
      pool.query('SELECT COUNT(*) FROM cabinets'),
      pool.query('SELECT COUNT(*) FROM slots'),
      pool.query('SELECT COUNT(*) FROM invoices'),
      pool.query('SELECT COUNT(*) FROM legal_documents'),
      pool.query('SELECT COUNT(*) FROM rent_agreements')
    ]);

    console.log('\n📊 Database Summary:');
    console.log(`Users: ${counts[0].rows[0].count}`);
    console.log(`Companies: ${counts[1].rows[0].count}`);
    console.log(`Locations: ${counts[2].rows[0].count}`);
    console.log(`Providers: ${counts[3].rows[0].count}`);
    console.log(`Game Mixes: ${counts[4].rows[0].count}`);
    console.log(`Cabinets: ${counts[5].rows[0].count}`);
    console.log(`Slots: ${counts[6].rows[0].count}`);
    console.log(`Invoices: ${counts[7].rows[0].count}`);
    console.log(`Legal Documents: ${counts[8].rows[0].count}`);
    console.log(`Rent Agreements: ${counts[9].rows[0].count}`);

  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    await pool.end();
  }
}

populateDatabase(); 