-- Initial migration: Create all base tables
CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY,
  "username" varchar(255) NOT NULL UNIQUE,
  "email" varchar(255) NOT NULL UNIQUE,
  "telephone" varchar(50),
  "password" text NOT NULL,
  "first_name" varchar(255),
  "last_name" varchar(255),
  "role" varchar(50) NOT NULL DEFAULT 'operator',
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "companies" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "registration_number" varchar(100),
  "tax_id" varchar(100),
  "address" text,
  "city" varchar(100),
  "country" varchar(100),
  "phone" varchar(50),
  "email" varchar(255),
  "website" varchar(255),
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "locations" (
  "id" serial PRIMARY KEY,
  "company_id" integer REFERENCES "companies"("id"),
  "name" varchar(255) NOT NULL,
  "address" text NOT NULL,
  "city" varchar(100) NOT NULL,
  "county" varchar(100),
  "country" varchar(100) NOT NULL,
  "phone" varchar(50),
  "email" varchar(255),
  "manager_id" integer REFERENCES "users"("id"),
  "latitude" numeric(10,8),
  "longitude" numeric(11,8),
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_locations" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "location_id" integer NOT NULL REFERENCES "locations"("id"),
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "providers" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "company_name" varchar(255),
  "contact_person" varchar(255),
  "email" varchar(255),
  "phone" varchar(50),
  "address" text,
  "city" varchar(100),
  "country" varchar(100),
  "website" varchar(255),
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "cabinets" (
  "id" serial PRIMARY KEY,
  "serial_number" varchar(100),
  "model" varchar(255) NOT NULL,
  "manufacturer" varchar(255),
  "provider_id" integer REFERENCES "providers"("id"),
  "location_id" integer REFERENCES "locations"("id"),
  "status" varchar(50) NOT NULL DEFAULT 'active',
  "web_link" varchar(500),
  "last_maintenance_date" timestamp,
  "next_maintenance_date" timestamp,
  "daily_revenue" decimal(10,2),
  "specifications" jsonb,
  "technical_info" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "game_mixes" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "description" text,
  "provider_id" integer REFERENCES "providers"("id"),
  "games" text,
  "game_count" integer NOT NULL DEFAULT 0,
  "web_link" varchar(500),
  "configuration" jsonb,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "invoices" (
  "id" serial PRIMARY KEY,
  "invoice_number" varchar(100) NOT NULL UNIQUE,
  "company_id" integer REFERENCES "companies"("id"),
  "seller_company_id" integer REFERENCES "companies"("id"),
  "location_ids" text,
  "invoice_date" timestamp NOT NULL,
  "due_date" timestamp NOT NULL,
  "subtotal" decimal(10,2) NOT NULL,
  "tax_amount" decimal(10,2) NOT NULL,
  "total_amount" decimal(10,2) NOT NULL,
  "status" varchar(50) NOT NULL DEFAULT 'pending',
  "paid_date" timestamp,
  "serial_numbers" text,
  "amortization_months" integer,
  "property_type" varchar(50) DEFAULT 'property',
  "currency" varchar(3) DEFAULT 'EUR',
  "notes" text,
  "created_by" integer REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "rent_agreements" (
  "id" serial PRIMARY KEY,
  "agreement_number" varchar(100) NOT NULL UNIQUE,
  "company_id" integer REFERENCES "companies"("id"),
  "location_id" integer REFERENCES "locations"("id"),
  "start_date" timestamp NOT NULL,
  "end_date" timestamp NOT NULL,
  "monthly_rent" decimal(10,2) NOT NULL,
  "security_deposit" decimal(10,2),
  "terms" text,
  "status" varchar(50) NOT NULL DEFAULT 'active',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "legal_documents" (
  "id" serial PRIMARY KEY,
  "title" varchar(255) NOT NULL,
  "document_type" varchar(100) NOT NULL,
  "company_id" integer REFERENCES "companies"("id"),
  "location_ids" text,
  "issue_date" timestamp,
  "expiry_date" timestamp,
  "issuing_authority" varchar(255),
  "document_number" varchar(100),
  "status" varchar(50) NOT NULL DEFAULT 'active',
  "file_path" varchar(500),
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "onjn_reports" (
  "id" serial PRIMARY KEY,
  "report_number" varchar(100) NOT NULL UNIQUE,
  "company_id" integer REFERENCES "companies"("id"),
  "location_id" integer REFERENCES "locations"("id"),
  "report_type" varchar(50) NOT NULL,
  "submission_date" timestamp NOT NULL,
  "status" varchar(50) NOT NULL DEFAULT 'pending',
  "approval_date" timestamp,
  "expiry_date" timestamp,
  "document_path" varchar(500),
  "notes" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "slots" (
  "id" serial PRIMARY KEY,
  "cabinet_id" integer REFERENCES "cabinets"("id"),
  "game_mix_id" integer REFERENCES "game_mixes"("id"),
  "provider_id" integer REFERENCES "providers"("id"),
  "location_id" integer REFERENCES "locations"("id"),
  "exciter_type" varchar(100),
  "denomination" decimal(8,2),
  "max_bet" decimal(8,2),
  "rtp" decimal(5,2),
  "property_type" varchar(50) NOT NULL DEFAULT 'property',
  "owner_id" integer,
  "serial_nr" varchar(100),
  "invoice_id" integer REFERENCES "invoices"("id"),
  "commission_date" timestamp,
  "onjn_report_id" integer REFERENCES "onjn_reports"("id"),
  "daily_revenue" decimal(10,2),
  "year" integer,
  "gaming_places" integer,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" serial PRIMARY KEY,
  "user_id" integer REFERENCES "users"("id"),
  "action" varchar(100) NOT NULL,
  "entity_type" varchar(50) NOT NULL,
  "entity_id" integer,
  "details" jsonb,
  "ip_address" varchar(45),
  "user_agent" text,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "attachments" (
  "id" serial PRIMARY KEY,
  "entity_type" varchar(50) NOT NULL,
  "entity_id" integer NOT NULL,
  "file_name" varchar(255) NOT NULL,
  "file_path" varchar(500) NOT NULL,
  "file_size" integer,
  "mime_type" varchar(100),
  "uploaded_by" integer REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now()
); 