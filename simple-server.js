import express from 'express';

const app = express();

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({ 
      user: { 
        id: 1, 
        username: 'admin', 
        email: 'admin@example.com', 
        firstName: 'Admin', 
        lastName: 'User',
        role: 'admin' 
      } 
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Get current user
app.get('/api/auth/user', (req, res) => {
  res.json({ 
    id: 1, 
    username: 'admin', 
    email: 'admin@example.com', 
    firstName: 'Admin', 
    lastName: 'User',
    role: 'admin' 
  });
});

// Mock data endpoints
app.get('/api/companies', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const companies = [
    { id: 1, name: 'Company A', email: 'contact@companya.com', phone: '+1234567890', address: '123 Main St' },
    { id: 2, name: 'Company B', email: 'info@companyb.com', phone: '+0987654321', address: '456 Oak Ave' },
    { id: 3, name: 'Company C', email: 'hello@companyc.com', phone: '+1122334455', address: '789 Pine Rd' }
  ];
  
  res.json({
    data: companies,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: companies.length,
      totalPages: Math.ceil(companies.length / limit)
    }
  });
});

app.get('/api/locations', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const locations = [
    { id: 1, name: 'Location A', address: '123 Main St', city: 'New York', country: 'USA' },
    { id: 2, name: 'Location B', address: '456 Oak Ave', city: 'Los Angeles', country: 'USA' },
    { id: 3, name: 'Location C', address: '789 Pine Rd', city: 'Chicago', country: 'USA' }
  ];
  
  res.json({
    data: locations,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: locations.length,
      totalPages: Math.ceil(locations.length / limit)
    }
  });
});

app.get('/api/users', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const users = [
    { id: 1, username: 'admin', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'admin' },
    { id: 2, username: 'user1', email: 'user1@example.com', firstName: 'John', lastName: 'Doe', role: 'user' },
    { id: 3, username: 'user2', email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith', role: 'user' }
  ];
  
  res.json({
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: users.length,
      totalPages: Math.ceil(users.length / limit)
    }
  });
});

app.get('/api/cabinets', (req, res) => {
  const cabinets = [
    { id: 1, name: 'Cabinet A', location: 'Location A', status: 'active' },
    { id: 2, name: 'Cabinet B', location: 'Location B', status: 'active' },
    { id: 3, name: 'Cabinet C', location: 'Location C', status: 'maintenance' }
  ];
  
  res.json({ data: cabinets });
});

app.get('/api/providers', (req, res) => {
  const providers = [
    { id: 1, name: 'Provider A', contact: 'contact@providera.com', phone: '+1234567890' },
    { id: 2, name: 'Provider B', contact: 'info@providerb.com', phone: '+0987654321' },
    { id: 3, name: 'Provider C', contact: 'hello@providerc.com', phone: '+1122334455' }
  ];
  
  res.json({ data: providers });
});

app.get('/api/game-mixes', (req, res) => {
  const gameMixes = [
    { id: 1, name: 'Mix A', description: 'Popular games mix', games: ['Game 1', 'Game 2', 'Game 3'] },
    { id: 2, name: 'Mix B', description: 'Classic games mix', games: ['Game 4', 'Game 5', 'Game 6'] },
    { id: 3, name: 'Mix C', description: 'New games mix', games: ['Game 7', 'Game 8', 'Game 9'] }
  ];
  
  res.json({ data: gameMixes });
});

app.get('/api/invoices', (req, res) => {
  const invoices = [
    { id: 1, number: 'INV-001', amount: 1000, status: 'paid', date: '2024-01-15' },
    { id: 2, number: 'INV-002', amount: 1500, status: 'pending', date: '2024-01-20' },
    { id: 3, number: 'INV-003', amount: 2000, status: 'overdue', date: '2024-01-25' }
  ];
  
  res.json({ data: invoices });
});

app.get('/api/legal-documents', (req, res) => {
  const documents = [
    { id: 1, title: 'Terms of Service', type: 'legal', status: 'active' },
    { id: 2, title: 'Privacy Policy', type: 'legal', status: 'active' },
    { id: 3, title: 'License Agreement', type: 'contract', status: 'draft' }
  ];
  
  res.json({ data: documents });
});

app.get('/api/slots', (req, res) => {
  const slots = [
    { id: 1, name: 'Slot A', cabinet: 'Cabinet A', game: 'Game 1', status: 'active' },
    { id: 2, name: 'Slot B', cabinet: 'Cabinet B', game: 'Game 2', status: 'active' },
    { id: 3, name: 'Slot C', cabinet: 'Cabinet C', game: 'Game 3', status: 'maintenance' }
  ];
  
  res.json({ data: slots });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Simple server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`Credențiale: admin / admin123`);
}); 