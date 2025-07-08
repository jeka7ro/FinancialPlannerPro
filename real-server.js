import express from 'express';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'none'
  }
}));

// Database connection - use environment variable for Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/cashpot_gaming'
});

// JWT Authentication middleware
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key');
    
    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT authentication error:', error);
    res.status(401).json({ message: 'Not authenticated' });
  }
};

// Serve static files from client/dist
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// CORS - allow both localhost and production domains
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'https://financial-planner-pro-client.vercel.app',
    'https://financial-planner-pro.vercel.app',
    'https://financial-planner-pro.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Test database connection
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database: Connected to PostgreSQL');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Setup database with sample data if empty
async function setupDatabaseIfEmpty() {
  try {
    const client = await pool.connect();
    
    // Check if companies exist
    const companiesResult = await client.query('SELECT COUNT(*) FROM companies');
    const companiesCount = parseInt(companiesResult.rows[0].count);
    
    if (companiesCount === 0) {
      console.log('🔧 Setting up database with sample data...');
      
      // Create admin user if it doesn't exist
      const userResult = await client.query('SELECT COUNT(*) FROM users WHERE username = $1', ['admin']);
      
      if (parseInt(userResult.rows[0].count) === 0) {
        const bcrypt = await import('bcrypt');
        const adminPassword = await bcrypt.hash('admin123', 10);
        
        await client.query(`
          INSERT INTO users (username, email, password, first_name, last_name, role, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        `, ['admin', 'admin@example.com', adminPassword, 'Admin', 'User', 'admin']);
      }
      
      // Create sample companies
      await client.query(`
        INSERT INTO companies (name, email, phone, address, created_at, updated_at)
        VALUES 
          ('Company A', 'contact@companya.com', '+1234567890', '123 Main St', NOW(), NOW()),
          ('Company B', 'info@companyb.com', '+0987654321', '456 Oak Ave', NOW(), NOW()),
          ('Company C', 'hello@companyc.com', '+1122334455', '789 Pine Rd', NOW(), NOW())
      `);
      
      // Create sample locations
      await client.query(`
        INSERT INTO locations (name, address, city, country, created_at, updated_at)
        VALUES 
          ('Location A', '123 Main St', 'New York', 'USA', NOW(), NOW()),
          ('Location B', '456 Oak Ave', 'Los Angeles', 'USA', NOW(), NOW()),
          ('Location C', '789 Pine Rd', 'Chicago', 'USA', NOW(), NOW())
      `);
      
      // Create sample providers
      await client.query(`
        INSERT INTO providers (name, email, phone, address, created_at, updated_at)
        VALUES 
          ('Provider A', 'contact@providera.com', '+1234567890', '123 Provider St', NOW(), NOW()),
          ('Provider B', 'info@providerb.com', '+0987654321', '456 Provider Ave', NOW(), NOW()),
          ('Provider C', 'hello@providerc.com', '+1122334455', '789 Provider Rd', NOW(), NOW())
      `);
      
      // Create sample cabinets
      await client.query(`
        INSERT INTO cabinets (name, location_id, provider_id, status, created_at, updated_at)
        VALUES 
          ('Cabinet A', 1, 1, 'active', NOW(), NOW()),
          ('Cabinet B', 2, 2, 'active', NOW(), NOW()),
          ('Cabinet C', 3, 3, 'active', NOW(), NOW())
      `);
      
      // Create sample game mixes
      await client.query(`
        INSERT INTO game_mixes (name, description, status, created_at, updated_at)
        VALUES 
          ('Mix A', 'Sample game mix A', 'active', NOW(), NOW()),
          ('Mix B', 'Sample game mix B', 'active', NOW(), NOW()),
          ('Mix C', 'Sample game mix C', 'active', NOW(), NOW())
      `);
      
      // Create sample slots
      await client.query(`
        INSERT INTO slots (name, cabinet_id, game_mix_id, status, created_at, updated_at)
        VALUES 
          ('Slot A', 1, 1, 'active', NOW(), NOW()),
          ('Slot B', 2, 2, 'active', NOW(), NOW()),
          ('Slot C', 3, 3, 'active', NOW(), NOW())
      `);
      
      // Create sample invoices
      await client.query(`
        INSERT INTO invoices (number, company_id, amount, due_date, status, created_at, updated_at)
        VALUES 
          ('INV-001', 1, 1000.00, '2025-08-01', 'pending', NOW(), NOW()),
          ('INV-002', 2, 2000.00, '2025-08-15', 'paid', NOW(), NOW()),
          ('INV-003', 3, 1500.00, '2025-08-30', 'pending', NOW(), NOW())
      `);
      
      // Create sample legal documents
      await client.query(`
        INSERT INTO legal_documents (title, content, status, created_at, updated_at)
        VALUES 
          ('Terms of Service', 'Sample terms of service content', 'active', NOW(), NOW()),
          ('Privacy Policy', 'Sample privacy policy content', 'active', NOW(), NOW()),
          ('License Agreement', 'Sample license agreement content', 'active', NOW(), NOW())
      `);
      
      // Create sample rent agreements
      await client.query(`
        INSERT INTO rent_agreements (company_id, location_id, start_date, end_date, amount, status, created_at, updated_at)
        VALUES 
          (1, 1, '2025-01-01', '2025-12-31', 5000.00, 'active', NOW(), NOW()),
          (2, 2, '2025-01-01', '2025-12-31', 6000.00, 'active', NOW(), NOW()),
          (3, 3, '2025-01-01', '2025-12-31', 4500.00, 'active', NOW(), NOW())
      `);
      
      console.log('✅ Database setup completed!');
    } else {
      console.log('ℹ️ Database already has data');
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

// Health check with database status
app.get('/api/health', async (req, res) => {
  const dbConnected = await testDatabaseConnection();
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Manual database setup endpoint
app.post('/api/setup-database', async (req, res) => {
  try {
    await setupDatabaseIfEmpty();
    res.json({ message: 'Database setup completed successfully' });
  } catch (error) {
    console.error('Setup endpoint error:', error);
    res.status(500).json({ message: 'Database setup failed' });
  }
});

// Force populate database endpoint
app.post('/api/populate-database', async (req, res) => {
  try {
    const client = await pool.connect();
    
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
    
    // Create sample companies
    await client.query(`
      INSERT INTO companies (name, email, phone, address, created_at, updated_at)
      VALUES 
        ('Company A', 'contact@companya.com', '+1234567890', '123 Main St', NOW(), NOW()),
        ('Company B', 'info@companyb.com', '+0987654321', '456 Oak Ave', NOW(), NOW()),
        ('Company C', 'hello@companyc.com', '+1122334455', '789 Pine Rd', NOW(), NOW())
    `);
    
    // Create sample locations
    await client.query(`
      INSERT INTO locations (name, address, city, country, created_at, updated_at)
      VALUES 
        ('Location A', '123 Main St', 'New York', 'USA', NOW(), NOW()),
        ('Location B', '456 Oak Ave', 'Los Angeles', 'USA', NOW(), NOW()),
        ('Location C', '789 Pine Rd', 'Chicago', 'USA', NOW(), NOW())
    `);
    
    // Create sample providers
    await client.query(`
      INSERT INTO providers (name, email, phone, address, created_at, updated_at)
      VALUES 
        ('Provider A', 'contact@providera.com', '+1234567890', '123 Provider St', NOW(), NOW()),
        ('Provider B', 'info@providerb.com', '+0987654321', '456 Provider Ave', NOW(), NOW()),
        ('Provider C', 'hello@providerc.com', '+1122334455', '789 Provider Rd', NOW(), NOW())
    `);
    
    // Create sample cabinets
    await client.query(`
      INSERT INTO cabinets (name, location_id, provider_id, status, created_at, updated_at)
      VALUES 
        ('Cabinet A', 1, 1, 'active', NOW(), NOW()),
        ('Cabinet B', 2, 2, 'active', NOW(), NOW()),
        ('Cabinet C', 3, 3, 'active', NOW(), NOW())
    `);
    
    // Create sample game mixes
    await client.query(`
      INSERT INTO game_mixes (name, description, status, created_at, updated_at)
      VALUES 
        ('Mix A', 'Sample game mix A', 'active', NOW(), NOW()),
        ('Mix B', 'Sample game mix B', 'active', NOW(), NOW()),
        ('Mix C', 'Sample game mix C', 'active', NOW(), NOW())
    `);
    
    // Create sample slots
    await client.query(`
      INSERT INTO slots (name, cabinet_id, game_mix_id, status, created_at, updated_at)
      VALUES 
        ('Slot A', 1, 1, 'active', NOW(), NOW()),
        ('Slot B', 2, 2, 'active', NOW(), NOW()),
        ('Slot C', 3, 3, 'active', NOW(), NOW())
    `);
    
    // Create sample invoices
    await client.query(`
      INSERT INTO invoices (number, company_id, amount, due_date, status, created_at, updated_at)
      VALUES 
        ('INV-001', 1, 1000.00, '2025-08-01', 'pending', NOW(), NOW()),
        ('INV-002', 2, 2000.00, '2025-08-15', 'paid', NOW(), NOW()),
        ('INV-003', 3, 1500.00, '2025-08-30', 'pending', NOW(), NOW())
    `);
    
    // Create sample legal documents
    await client.query(`
      INSERT INTO legal_documents (title, content, status, created_at, updated_at)
      VALUES 
        ('Terms of Service', 'Sample terms of service content', 'active', NOW(), NOW()),
        ('Privacy Policy', 'Sample privacy policy content', 'active', NOW(), NOW()),
        ('License Agreement', 'Sample license agreement content', 'active', NOW(), NOW())
    `);
    
    // Create sample rent agreements
    await client.query(`
      INSERT INTO rent_agreements (company_id, location_id, start_date, end_date, amount, status, created_at, updated_at)
      VALUES 
        (1, 1, '2025-01-01', '2025-12-31', 5000.00, 'active', NOW(), NOW()),
        (2, 2, '2025-01-01', '2025-12-31', 6000.00, 'active', NOW(), NOW()),
        (3, 3, '2025-01-01', '2025-12-31', 4500.00, 'active', NOW(), NOW())
    `);
    
    client.release();
    res.json({ message: 'Database populated successfully with sample data' });
  } catch (error) {
    console.error('Populate endpoint error:', error);
    res.status(500).json({ message: 'Database population failed', error: error.message });
  }
});

// Add contact_person column endpoint
app.post('/api/add-contact-person-column', async (req, res) => {
  try {
    console.log('Adding contact_person column to companies table...');
    
    // Add the contact_person column if it doesn't exist
    await pool.query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255)
    `);
    
    console.log('✅ contact_person column added successfully');
    res.json({ 
      success: true, 
      message: 'contact_person column added to companies table' 
    });
  } catch (error) {
    console.error('❌ Error adding contact_person column:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-jwt-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user
app.get('/api/auth/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key');
    
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Companies
app.get('/api/companies', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT * FROM companies ORDER BY id LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM companies');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Companies error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create company
app.post('/api/companies', authenticateJWT, async (req, res) => {
  try {

    const { 
      name, 
      email, 
      phone, 
      address, 
      registration_number, 
      tax_id, 
      city, 
      country, 
      website, 
      contact_person, 
      status 
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Use minimal insert with only basic fields that definitely exist
    result = await pool.query(
      `INSERT INTO companies (
        name, email, phone, address, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, NOW(), NOW()) 
      RETURNING *`,
      [name, email, phone, address]
    );

    res.status(201).json({
      message: 'Company created successfully',
      company: result.rows[0]
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update company
app.put('/api/companies/:id', authenticateJWT, async (req, res) => {
  try {
    console.log('Update company request:', { id: req.params.id, body: req.body, user: req.user });

    const { id } = req.params;
    const { 
      name, 
      email, 
      phone, 
      address, 
      registration_number, 
      tax_id, 
      city, 
      country, 
      website, 
      contact_person, 
      status 
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if company exists
    const existingCompany = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    if (existingCompany.rows.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Use minimal update with only basic fields that definitely exist
    result = await pool.query(
      `UPDATE companies SET 
        name = $1, email = $2, phone = $3, address = $4, updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [name, email, phone, address, id]
    );

    console.log('Company updated successfully:', result.rows[0]);

    res.json({
      message: 'Company updated successfully',
      company: result.rows[0]
    });
  } catch (error) {
    console.error('Update company error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Delete company
app.delete('/api/companies/:id', authenticateJWT, async (req, res) => {
  try {

    const { id } = req.params;

    // Check if company exists
    const existingCompany = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    if (existingCompany.rows.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    await pool.query('DELETE FROM companies WHERE id = $1', [id]);

    res.json({
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Redirect /companies to /api/companies
app.get('/companies', (req, res) => {
  res.redirect(301, '/api/companies');
});

// Locations
app.get('/api/locations', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT * FROM locations ORDER BY id LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM locations');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Locations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create location
app.post('/api/locations', authenticateJWT, async (req, res) => {
  try {
    const { name, address, city, country, phone, email, status } = req.body;
    
    // Validate required fields
    if (!name || !address || !city || !country) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['name', 'address', 'city', 'country'],
        received: { name, address, city, country }
      });
    }
    
    const result = await pool.query(
      `INSERT INTO locations (name, address, city, country, phone, email, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
      [name, address, city, country, phone, email, status || 'active']
    );
    res.status(201).json({ message: 'Location created', location: result.rows[0] });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Users
app.get('/api/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT id, username, email, first_name, last_name, role FROM users ORDER BY id LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create user
app.post('/api/users', authenticateJWT, async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['username', 'email', 'password'],
        received: { username, email, password: password ? '[HIDDEN]' : null }
      });
    }
    
    const bcrypt = (await import('bcrypt')).default;
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, first_name, last_name, role`,
      [username, email, hashed, first_name, last_name, role || 'user']
    );
    res.status(201).json({ message: 'User created', user: result.rows[0] });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Providers
app.get('/api/providers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT * FROM providers ORDER BY id LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM providers');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Providers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create provider
app.post('/api/providers', authenticateJWT, async (req, res) => {
  try {
    const { name, email, phone, address, status } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const result = await pool.query(
      `INSERT INTO providers (name, email, phone, address, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
      [name, email, phone, address, status || 'active']
    );
    res.status(201).json({ message: 'Provider created', provider: result.rows[0] });
  } catch (error) {
    console.error('Create provider error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cabinets
app.get('/api/cabinets', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT * FROM cabinets ORDER BY id LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM cabinets');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Cabinets error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create cabinet
app.post('/api/cabinets', authenticateJWT, async (req, res) => {
  try {
    const { name, serial_number, location_id, provider_id, status } = req.body;
    if (!name || !serial_number) return res.status(400).json({ message: 'Name and serial_number are required' });
    const result = await pool.query(
      `INSERT INTO cabinets (name, serial_number, location_id, provider_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
      [name, serial_number, location_id, provider_id, status || 'active']
    );
    res.status(201).json({ message: 'Cabinet created', cabinet: result.rows[0] });
  } catch (error) {
    console.error('Create cabinet error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Game Mixes
app.get('/api/game-mixes', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT * FROM game_mixes ORDER BY id LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM game_mixes');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Game mixes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create game mix
app.post('/api/game-mixes', authenticateJWT, async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const result = await pool.query(
      `INSERT INTO game_mixes (name, description, status, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
      [name, description, status || 'active']
    );
    res.status(201).json({ message: 'Game mix created', game_mix: result.rows[0] });
  } catch (error) {
    console.error('Create game mix error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Slots
app.get('/api/slots', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT * FROM slots ORDER BY id LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM slots');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Slots error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create slot
app.post('/api/slots', authenticateJWT, async (req, res) => {
  try {
    const { name, cabinet_id, game_mix_id, status } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const result = await pool.query(
      `INSERT INTO slots (name, cabinet_id, game_mix_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [name, cabinet_id, game_mix_id, status || 'active']
    );
    res.status(201).json({ message: 'Slot created', slot: result.rows[0] });
  } catch (error) {
    console.error('Create slot error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT * FROM invoices ORDER BY id LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM invoices');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Invoices error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create invoice
app.post('/api/invoices', authenticateJWT, async (req, res) => {
  try {
    const { number, company_id, amount, due_date, status } = req.body;
    if (!number || !company_id || !amount) return res.status(400).json({ message: 'Number, company_id, and amount are required' });
    const result = await pool.query(
      `INSERT INTO invoices (number, company_id, amount, due_date, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
      [number, company_id, amount, due_date, status || 'pending']
    );
    res.status(201).json({ message: 'Invoice created', invoice: result.rows[0] });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Legal Documents
app.get('/api/legal-documents', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT * FROM legal_documents ORDER BY id LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM legal_documents');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Legal documents error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create legal document
app.post('/api/legal-documents', authenticateJWT, async (req, res) => {
  try {
    const { title, content, status } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const result = await pool.query(
      `INSERT INTO legal_documents (title, content, status, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
      [title, content, status || 'active']
    );
    res.status(201).json({ message: 'Legal document created', legal_document: result.rows[0] });
  } catch (error) {
    console.error('Create legal document error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Rent Agreements
app.get('/api/rent-agreements', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT * FROM rent_agreements ORDER BY id LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM rent_agreements');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Rent agreements error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create rent agreement
app.post('/api/rent-agreements', authenticateJWT, async (req, res) => {
  try {
    const { company_id, location_id, start_date, end_date, amount, status } = req.body;
    if (!company_id || !location_id || !start_date || !end_date) return res.status(400).json({ message: 'company_id, location_id, start_date, end_date are required' });
    const result = await pool.query(
      `INSERT INTO rent_agreements (company_id, location_id, start_date, end_date, amount, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
      [company_id, location_id, start_date, end_date, amount, status || 'active']
    );
    res.status(201).json({ message: 'Rent agreement created', rent_agreement: result.rows[0] });
  } catch (error) {
    console.error('Create rent agreement error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`✅ Real server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`Credențiale: admin / admin123`);
  
  // Test database connection on startup
  await testDatabaseConnection();
  await setupDatabaseIfEmpty(); // Run database setup on startup
});

// Keep process alive
setInterval(() => {
  console.log('🔄 Server keep-alive tick...');
}, 30000); 