-- Insert admin user with bcrypt hashed password (password: admin123)
INSERT INTO users (username, email, password, first_name, last_name, role, is_active) 
VALUES (
    'admin', 
    'admin@example.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'admin123'
    'Admin', 
    'User', 
    'admin', 
    true
);

-- Insert a sample company
INSERT INTO companies (name, registration_number, tax_id, address, city, country, phone, email, contact_person, status) 
VALUES (
    'Sample Company SRL',
    'J12/123/2020',
    'RO12345678',
    'Strada Exemplu, Nr. 123',
    'Bucuresti',
    'Romania',
    '+40 123 456 789',
    'contact@samplecompany.ro',
    'Ion Popescu',
    'active'
);

-- Insert a sample location
INSERT INTO locations (company_id, name, address, city, county, country, phone, email, postal_code, status) 
VALUES (
    1, -- references the company we just created
    'Locatia Principala',
    'Strada Exemplu, Nr. 123',
    'Bucuresti',
    'Bucuresti',
    'Romania',
    '+40 123 456 789',
    'contact@samplecompany.ro',
    '010101',
    'active'
);

-- Insert a sample provider
INSERT INTO providers (name, company_name, contact_person, email, phone, address, city, country, status) 
VALUES (
    'Provider Gaming SRL',
    'Provider Gaming SRL',
    'Maria Ionescu',
    'contact@providergaming.ro',
    '+40 987 654 321',
    'Strada Provider, Nr. 456',
    'Bucuresti',
    'Romania',
    'active'
); 