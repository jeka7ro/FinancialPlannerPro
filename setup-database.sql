-- Create enums
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE status AS ENUM ('active', 'inactive', 'pending', 'suspended');

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    telephone VARCHAR(50),
    password TEXT NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role user_role DEFAULT 'user' NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    contact_person VARCHAR(255),
    status status DEFAULT 'active'
);

-- Create locations table
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    county VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    manager_id INTEGER REFERENCES users(id),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    postal_code VARCHAR(20),
    status status DEFAULT 'active'
);

-- Create user_locations table
CREATE TABLE user_locations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    location_id INTEGER NOT NULL REFERENCES locations(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create providers table
CREATE TABLE providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    website VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    status status DEFAULT 'active'
);

-- Create cabinets table
CREATE TABLE cabinets (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(100),
    model VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255),
    provider_id INTEGER REFERENCES providers(id),
    location_id INTEGER REFERENCES locations(id),
    status status DEFAULT 'active',
    web_link VARCHAR(500),
    last_maintenance_date TIMESTAMP,
    next_maintenance_date TIMESTAMP,
    daily_revenue DECIMAL(10,2),
    specifications JSONB,
    technical_info TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    name VARCHAR(255) NOT NULL
);

-- Create game_mixes table
CREATE TABLE game_mixes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    provider_id INTEGER REFERENCES providers(id),
    games TEXT,
    game_count INTEGER NOT NULL DEFAULT 0,
    web_link VARCHAR(500),
    configuration JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    status status DEFAULT 'active'
);

-- Create invoices table
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    company_id INTEGER REFERENCES companies(id),
    seller_company_id INTEGER REFERENCES companies(id),
    location_ids TEXT,
    invoice_date TIMESTAMP NOT NULL,
    due_date TIMESTAMP NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status status DEFAULT 'active',
    paid_date TIMESTAMP,
    serial_numbers TEXT,
    amortization_months INTEGER,
    property_type VARCHAR(50) DEFAULT 'property',
    currency VARCHAR(3) DEFAULT 'EUR',
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create slots table
CREATE TABLE slots (
    id SERIAL PRIMARY KEY,
    cabinet_id INTEGER REFERENCES cabinets(id),
    game_mix_id INTEGER REFERENCES game_mixes(id),
    provider_id INTEGER REFERENCES providers(id),
    location_id INTEGER REFERENCES locations(id),
    exciter_type VARCHAR(100),
    denomination DECIMAL(8,2),
    max_bet DECIMAL(8,2),
    rtp DECIMAL(5,2),
    property_type VARCHAR(50) NOT NULL DEFAULT 'property',
    owner_id INTEGER,
    serial_nr VARCHAR(100),
    invoice_id INTEGER REFERENCES invoices(id),
    commission_date TIMESTAMP,
    onjn_report_id INTEGER,
    daily_revenue DECIMAL(10,2),
    year INTEGER,
    gaming_places INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    model VARCHAR(255),
    manufacturer VARCHAR(255),
    status status DEFAULT 'active'
);

-- Create rent_agreements table
CREATE TABLE rent_agreements (
    id SERIAL PRIMARY KEY,
    agreement_number VARCHAR(100) NOT NULL UNIQUE,
    company_id INTEGER REFERENCES companies(id),
    location_id INTEGER REFERENCES locations(id),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2),
    terms TEXT,
    status status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    landlord_name VARCHAR(255),
    tenant_name VARCHAR(255),
    property_address VARCHAR(500),
    currency VARCHAR(10),
    notes TEXT,
    created_by INTEGER REFERENCES users(id)
);

-- Create legal_documents table
CREATE TABLE legal_documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),
    description TEXT,
    company_id INTEGER REFERENCES companies(id),
    location_id INTEGER REFERENCES locations(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    status status DEFAULT 'active',
    created_by INTEGER REFERENCES users(id)
);

-- Create onjn_reports table
CREATE TABLE onjn_reports (
    id SERIAL PRIMARY KEY,
    report_number VARCHAR(100) NOT NULL UNIQUE,
    report_date TIMESTAMP,
    company_id INTEGER REFERENCES companies(id),
    location_id INTEGER REFERENCES locations(id),
    submission_date TIMESTAMP,
    notification_date TIMESTAMP,
    notification_type VARCHAR(100),
    notification_authority VARCHAR(255),
    commission_type VARCHAR(100),
    type VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    status status DEFAULT 'active',
    created_by INTEGER REFERENCES users(id)
);

-- Create activity_logs table
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create attachments table
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    description TEXT,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_locations_company_id ON locations(company_id);
CREATE INDEX idx_slots_location_id ON slots(location_id);
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at); 