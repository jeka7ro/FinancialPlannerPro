--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.user_locations DROP CONSTRAINT IF EXISTS user_locations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_locations DROP CONSTRAINT IF EXISTS user_locations_location_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slots DROP CONSTRAINT IF EXISTS slots_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slots DROP CONSTRAINT IF EXISTS slots_location_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slots DROP CONSTRAINT IF EXISTS slots_invoice_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slots DROP CONSTRAINT IF EXISTS slots_game_mix_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slots DROP CONSTRAINT IF EXISTS slots_cabinet_id_fkey;
ALTER TABLE IF EXISTS ONLY public.rent_agreements DROP CONSTRAINT IF EXISTS rent_agreements_location_id_fkey;
ALTER TABLE IF EXISTS ONLY public.rent_agreements DROP CONSTRAINT IF EXISTS rent_agreements_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.rent_agreements DROP CONSTRAINT IF EXISTS rent_agreements_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.onjn_reports DROP CONSTRAINT IF EXISTS onjn_reports_location_id_fkey;
ALTER TABLE IF EXISTS ONLY public.onjn_reports DROP CONSTRAINT IF EXISTS onjn_reports_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.onjn_reports DROP CONSTRAINT IF EXISTS onjn_reports_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.locations DROP CONSTRAINT IF EXISTS locations_manager_id_fkey;
ALTER TABLE IF EXISTS ONLY public.locations DROP CONSTRAINT IF EXISTS locations_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_documents DROP CONSTRAINT IF EXISTS legal_documents_location_id_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_documents DROP CONSTRAINT IF EXISTS legal_documents_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_documents DROP CONSTRAINT IF EXISTS legal_documents_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_seller_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.game_mixes DROP CONSTRAINT IF EXISTS game_mixes_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cabinets DROP CONSTRAINT IF EXISTS cabinets_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cabinets DROP CONSTRAINT IF EXISTS cabinets_location_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attachments DROP CONSTRAINT IF EXISTS attachments_uploaded_by_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;
DROP INDEX IF EXISTS public.idx_users_username;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_slots_location_id;
DROP INDEX IF EXISTS public.idx_locations_company_id;
DROP INDEX IF EXISTS public.idx_invoices_company_id;
DROP INDEX IF EXISTS public.idx_companies_name;
DROP INDEX IF EXISTS public.idx_activity_logs_user_id;
DROP INDEX IF EXISTS public.idx_activity_logs_created_at;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.user_locations DROP CONSTRAINT IF EXISTS user_locations_pkey;
ALTER TABLE IF EXISTS ONLY public.slots DROP CONSTRAINT IF EXISTS slots_pkey;
ALTER TABLE IF EXISTS ONLY public.rent_agreements DROP CONSTRAINT IF EXISTS rent_agreements_pkey;
ALTER TABLE IF EXISTS ONLY public.rent_agreements DROP CONSTRAINT IF EXISTS rent_agreements_agreement_number_key;
ALTER TABLE IF EXISTS ONLY public.providers DROP CONSTRAINT IF EXISTS providers_pkey;
ALTER TABLE IF EXISTS ONLY public.onjn_reports DROP CONSTRAINT IF EXISTS onjn_reports_report_number_key;
ALTER TABLE IF EXISTS ONLY public.onjn_reports DROP CONSTRAINT IF EXISTS onjn_reports_pkey;
ALTER TABLE IF EXISTS ONLY public.locations DROP CONSTRAINT IF EXISTS locations_pkey;
ALTER TABLE IF EXISTS ONLY public.legal_documents DROP CONSTRAINT IF EXISTS legal_documents_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_invoice_number_key;
ALTER TABLE IF EXISTS ONLY public.game_mixes DROP CONSTRAINT IF EXISTS game_mixes_pkey;
ALTER TABLE IF EXISTS ONLY public.companies DROP CONSTRAINT IF EXISTS companies_pkey;
ALTER TABLE IF EXISTS ONLY public.cabinets DROP CONSTRAINT IF EXISTS cabinets_pkey;
ALTER TABLE IF EXISTS ONLY public.attachments DROP CONSTRAINT IF EXISTS attachments_pkey;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_locations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.slots ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rent_agreements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.providers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.onjn_reports ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.locations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.legal_documents ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.invoices ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.game_mixes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.companies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.cabinets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.attachments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.activity_logs ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.user_locations_id_seq;
DROP TABLE IF EXISTS public.user_locations;
DROP SEQUENCE IF EXISTS public.slots_id_seq;
DROP TABLE IF EXISTS public.slots;
DROP SEQUENCE IF EXISTS public.rent_agreements_id_seq;
DROP TABLE IF EXISTS public.rent_agreements;
DROP SEQUENCE IF EXISTS public.providers_id_seq;
DROP TABLE IF EXISTS public.providers;
DROP SEQUENCE IF EXISTS public.onjn_reports_id_seq;
DROP TABLE IF EXISTS public.onjn_reports;
DROP SEQUENCE IF EXISTS public.locations_id_seq;
DROP TABLE IF EXISTS public.locations;
DROP SEQUENCE IF EXISTS public.legal_documents_id_seq;
DROP TABLE IF EXISTS public.legal_documents;
DROP SEQUENCE IF EXISTS public.invoices_id_seq;
DROP TABLE IF EXISTS public.invoices;
DROP SEQUENCE IF EXISTS public.game_mixes_id_seq;
DROP TABLE IF EXISTS public.game_mixes;
DROP SEQUENCE IF EXISTS public.companies_id_seq;
DROP TABLE IF EXISTS public.companies;
DROP SEQUENCE IF EXISTS public.cabinets_id_seq;
DROP TABLE IF EXISTS public.cabinets;
DROP SEQUENCE IF EXISTS public.attachments_id_seq;
DROP TABLE IF EXISTS public.attachments;
DROP SEQUENCE IF EXISTS public.activity_logs_id_seq;
DROP TABLE IF EXISTS public.activity_logs;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.status;
--
-- Name: status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status AS ENUM (
    'active',
    'inactive',
    'pending',
    'suspended'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'user'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(255) NOT NULL,
    entity_type character varying(100),
    entity_id integer,
    details jsonb,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attachments (
    id integer NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id integer NOT NULL,
    original_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size integer NOT NULL,
    mime_type character varying(100) NOT NULL,
    description text,
    uploaded_by integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attachments_id_seq OWNED BY public.attachments.id;


--
-- Name: cabinets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cabinets (
    id integer NOT NULL,
    serial_number character varying(100),
    model character varying(255) NOT NULL,
    manufacturer character varying(255),
    provider_id integer,
    location_id integer,
    status public.status DEFAULT 'active'::public.status,
    web_link character varying(500),
    last_maintenance_date timestamp without time zone,
    next_maintenance_date timestamp without time zone,
    daily_revenue numeric(10,2),
    specifications jsonb,
    technical_info text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    name character varying(255) NOT NULL
);


--
-- Name: cabinets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cabinets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cabinets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cabinets_id_seq OWNED BY public.cabinets.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    registration_number character varying(100),
    tax_id character varying(100),
    address text,
    city character varying(100),
    country character varying(100),
    phone character varying(50),
    email character varying(255),
    website character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    contact_person character varying(255),
    status public.status DEFAULT 'active'::public.status
);


--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: game_mixes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_mixes (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    provider_id integer,
    games text,
    game_count integer DEFAULT 0 NOT NULL,
    web_link character varying(500),
    configuration jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    status public.status DEFAULT 'active'::public.status
);


--
-- Name: game_mixes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.game_mixes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: game_mixes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.game_mixes_id_seq OWNED BY public.game_mixes.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id integer NOT NULL,
    invoice_number character varying(100) NOT NULL,
    company_id integer,
    seller_company_id integer,
    location_ids text,
    invoice_date timestamp without time zone NOT NULL,
    due_date timestamp without time zone NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    tax_amount numeric(10,2) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    status public.status DEFAULT 'active'::public.status,
    paid_date timestamp without time zone,
    serial_numbers text,
    amortization_months integer,
    property_type character varying(50) DEFAULT 'property'::character varying,
    currency character varying(3) DEFAULT 'EUR'::character varying,
    notes text,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: legal_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.legal_documents (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    document_type character varying(100),
    file_path character varying(500),
    file_size integer,
    mime_type character varying(100),
    description text,
    company_id integer,
    location_id integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    status public.status DEFAULT 'active'::public.status,
    created_by integer
);


--
-- Name: legal_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.legal_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: legal_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.legal_documents_id_seq OWNED BY public.legal_documents.id;


--
-- Name: locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locations (
    id integer NOT NULL,
    company_id integer,
    name character varying(255) NOT NULL,
    address text NOT NULL,
    city character varying(100) NOT NULL,
    county character varying(100),
    country character varying(100) NOT NULL,
    phone character varying(50),
    email character varying(255),
    manager_id integer,
    latitude numeric(10,8),
    longitude numeric(11,8),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    postal_code character varying(20),
    status public.status DEFAULT 'active'::public.status
);


--
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;


--
-- Name: onjn_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onjn_reports (
    id integer NOT NULL,
    report_number character varying(100) NOT NULL,
    report_date timestamp without time zone,
    company_id integer,
    location_id integer,
    submission_date timestamp without time zone,
    notification_date timestamp without time zone,
    notification_type character varying(100),
    notification_authority character varying(255),
    commission_type character varying(100),
    type character varying(100),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    status public.status DEFAULT 'active'::public.status,
    created_by integer
);


--
-- Name: onjn_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.onjn_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: onjn_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.onjn_reports_id_seq OWNED BY public.onjn_reports.id;


--
-- Name: providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.providers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    company_name character varying(255),
    contact_person character varying(255),
    email character varying(255),
    phone character varying(50),
    address text,
    city character varying(100),
    country character varying(100),
    website character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    status public.status DEFAULT 'active'::public.status
);


--
-- Name: providers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.providers_id_seq OWNED BY public.providers.id;


--
-- Name: rent_agreements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rent_agreements (
    id integer NOT NULL,
    agreement_number character varying(100) NOT NULL,
    company_id integer,
    location_id integer,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    monthly_rent numeric(10,2) NOT NULL,
    security_deposit numeric(10,2),
    terms text,
    status public.status DEFAULT 'active'::public.status,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    landlord_name character varying(255),
    tenant_name character varying(255),
    property_address character varying(500),
    currency character varying(10),
    notes text,
    created_by integer
);


--
-- Name: rent_agreements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rent_agreements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rent_agreements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rent_agreements_id_seq OWNED BY public.rent_agreements.id;


--
-- Name: slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.slots (
    id integer NOT NULL,
    cabinet_id integer,
    game_mix_id integer,
    provider_id integer,
    location_id integer,
    exciter_type character varying(100),
    denomination numeric(8,2),
    max_bet numeric(8,2),
    rtp numeric(5,2),
    property_type character varying(50) DEFAULT 'property'::character varying NOT NULL,
    owner_id integer,
    serial_nr character varying(100),
    invoice_id integer,
    commission_date timestamp without time zone,
    onjn_report_id integer,
    daily_revenue numeric(10,2),
    year integer,
    gaming_places integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    model character varying(255),
    manufacturer character varying(255),
    status public.status DEFAULT 'active'::public.status
);


--
-- Name: slots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.slots_id_seq OWNED BY public.slots.id;


--
-- Name: user_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_locations (
    id integer NOT NULL,
    user_id integer NOT NULL,
    location_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: user_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_locations_id_seq OWNED BY public.user_locations.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    telephone character varying(50),
    password text NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments ALTER COLUMN id SET DEFAULT nextval('public.attachments_id_seq'::regclass);


--
-- Name: cabinets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cabinets ALTER COLUMN id SET DEFAULT nextval('public.cabinets_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: game_mixes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_mixes ALTER COLUMN id SET DEFAULT nextval('public.game_mixes_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: legal_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_documents ALTER COLUMN id SET DEFAULT nextval('public.legal_documents_id_seq'::regclass);


--
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- Name: onjn_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onjn_reports ALTER COLUMN id SET DEFAULT nextval('public.onjn_reports_id_seq'::regclass);


--
-- Name: providers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.providers ALTER COLUMN id SET DEFAULT nextval('public.providers_id_seq'::regclass);


--
-- Name: rent_agreements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_agreements ALTER COLUMN id SET DEFAULT nextval('public.rent_agreements_id_seq'::regclass);


--
-- Name: slots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slots ALTER COLUMN id SET DEFAULT nextval('public.slots_id_seq'::regclass);


--
-- Name: user_locations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_locations ALTER COLUMN id SET DEFAULT nextval('public.user_locations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attachments (id, entity_type, entity_id, original_name, file_path, file_size, mime_type, description, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: cabinets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cabinets (id, serial_number, model, manufacturer, provider_id, location_id, status, web_link, last_maintenance_date, next_maintenance_date, daily_revenue, specifications, technical_info, is_active, created_at, updated_at, name) FROM stdin;
2	NOV-DL-001	Diamond Line 1.2	Novomatic	2	3	active	\N	\N	\N	\N	\N	\N	t	2025-07-08 06:15:56.207563	2025-07-08 06:15:56.207563	Novomatic Diamond Line 1.2
3	IGT-S2K-001	S2000	IGT	3	4	active	\N	\N	\N	\N	\N	\N	t	2025-07-08 06:15:56.21082	2025-07-08 06:15:56.21082	IGT S2000
4	SG-PW-001	Pro Wave	Scientific Games	4	5	active	\N	\N	\N	\N	\N	\N	t	2025-07-08 06:15:56.21168	2025-07-08 06:15:56.21168	Scientific Games Pro Wave
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.companies (id, name, registration_number, tax_id, address, city, country, phone, email, website, is_active, created_at, updated_at, contact_person, status) FROM stdin;
1	Sample Company SRL	J12/123/2020	RO12345678	Strada Exemplu, Nr. 123	Bucuresti	Romania	+40 123 456 789	contact@samplecompany.ro	\N	t	2025-07-08 00:33:07.801431	2025-07-08 00:33:07.801431	Ion Popescu	active
2	Test Company	\N	\N	\N	\N	\N	\N	test@test.com	\N	t	2025-07-08 06:05:32.429891	2025-07-08 06:05:32.429891	\N	active
3	TRADE INVEST NETWORK	\N	\N	str. Popa Savu 78, ap.3\nSector 1	Bucuresti	Romania	0729030303	jeka7ro@gmail.com		t	2025-07-08 06:06:12.839002	2025-07-08 06:06:12.839002	\N	active
4	TRADE INVEST NETWORK	\N	\N	str. Popa Savu 78, ap.3\nSector 1	Bucuresti	Romania	0729030303	jeka7ro@gmail.com		t	2025-07-08 06:10:51.432103	2025-07-08 06:10:51.432103	\N	active
5	Gaming Solutions SRL	RO12345678	RO12345678	Strada Gaming 123, Sector 1	București	România	+40 21 123 4567	contact@gamingsolutions.ro	https://gamingsolutions.ro	t	2025-07-08 06:14:42.340307	2025-07-08 06:14:42.340307	Ion Popescu	active
6	Digital Entertainment Ltd	RO87654321	RO87654321	Bulevardul Digital 456, Sector 2	București	România	+40 31 987 6543	info@digitalentertainment.com	https://digitalentertainment.com	t	2025-07-08 06:14:42.342083	2025-07-08 06:14:42.342083	Maria Ionescu	active
7	Arcade Masters	RO55512345	RO55512345	Strada Arcade 789, Centru	Cluj-Napoca	România	+40 26 555 1234	hello@arcademasters.ro	https://arcademasters.ro	t	2025-07-08 06:14:42.343012	2025-07-08 06:14:42.343012	Alexandru Dumitrescu	active
\.


--
-- Data for Name: game_mixes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.game_mixes (id, name, description, provider_id, games, game_count, web_link, configuration, is_active, created_at, updated_at, status) FROM stdin;
1	Classic Slots Mix	Traditional slot machines with classic themes	\N	\N	0	\N	\N	t	2025-07-08 06:14:42.351894	2025-07-08 06:14:42.351894	active
2	Video Slots Premium	Modern video slots with advanced graphics and features	\N	\N	0	\N	\N	t	2025-07-08 06:14:42.353181	2025-07-08 06:14:42.353181	active
3	Progressive Jackpot Collection	High-stakes progressive jackpot games	\N	\N	0	\N	\N	t	2025-07-08 06:14:42.353648	2025-07-08 06:14:42.353648	active
4	Table Games Mix	Classic table games like blackjack, roulette, and poker	\N	\N	0	\N	\N	t	2025-07-08 06:14:42.354099	2025-07-08 06:14:42.354099	active
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, invoice_number, company_id, seller_company_id, location_ids, invoice_date, due_date, subtotal, tax_amount, total_amount, status, paid_date, serial_numbers, amortization_months, property_type, currency, notes, created_by, created_at, updated_at) FROM stdin;
1	INV-2024-001	5	\N	\N	2024-02-01 00:00:00	2024-02-15 00:00:00	4200.00	800.00	5000.00	pending	\N	\N	\N	property	EUR	\N	\N	2025-07-08 06:18:09.008038	2025-07-08 06:18:09.008038
2	INV-2024-002	6	\N	\N	2024-02-05 00:00:00	2024-02-20 00:00:00	6300.00	1200.00	7500.00	pending	\N	\N	\N	property	EUR	\N	\N	2025-07-08 06:18:09.013228	2025-07-08 06:18:09.013228
\.


--
-- Data for Name: legal_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.legal_documents (id, title, document_type, file_path, file_size, mime_type, description, company_id, location_id, is_active, created_at, updated_at, status, created_by) FROM stdin;
1	Gaming License Agreement	\N	\N	\N	\N	Standard gaming license agreement for slot machine operations in Romania.	\N	\N	t	2025-07-08 06:18:39.173967	2025-07-08 06:18:39.173967	active	\N
2	Data Protection Policy	\N	\N	\N	\N	Privacy policy and data protection measures for gaming operations.	\N	\N	t	2025-07-08 06:18:39.175227	2025-07-08 06:18:39.175227	active	\N
3	Responsible Gaming Policy	\N	\N	\N	\N	Guidelines for responsible gaming and player protection.	\N	\N	t	2025-07-08 06:18:39.175758	2025-07-08 06:18:39.175758	active	\N
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.locations (id, company_id, name, address, city, county, country, phone, email, manager_id, latitude, longitude, is_active, created_at, updated_at, postal_code, status) FROM stdin;
1	1	Locatia Principala	Strada Exemplu, Nr. 123	Bucuresti	Bucuresti	Romania	+40 123 456 789	contact@samplecompany.ro	\N	\N	\N	t	2025-07-08 00:33:07.80209	2025-07-08 00:33:07.80209	010101	active
3	\N	Mall Băneasa Gaming Zone	Șoseaua București-Ploiești 42D	București	\N	România	+40 21 123 4567	banesa@gamingsolutions.ro	\N	\N	\N	t	2025-07-08 06:14:42.345421	2025-07-08 06:14:42.345421	\N	active
4	\N	AFI Palace Cotroceni Arcade	Bulevardul Vasile Milea 4	București	\N	România	+40 21 234 5678	cotroceni@gamingsolutions.ro	\N	\N	\N	t	2025-07-08 06:14:42.346928	2025-07-08 06:14:42.346928	\N	active
5	\N	Iulius Mall Timișoara Gaming	Strada Aristide Demetriade 1	Timișoara	\N	România	+40 25 678 9012	timisoara@digitalentertainment.com	\N	\N	\N	t	2025-07-08 06:14:42.347666	2025-07-08 06:14:42.347666	\N	active
6	\N	Iulius Mall Cluj Gaming Center	Strada Vâlcele 1-3	Cluj-Napoca	\N	România	+40 26 456 7890	cluj@arcademasters.ro	\N	\N	\N	t	2025-07-08 06:14:42.348205	2025-07-08 06:14:42.348205	\N	active
\.


--
-- Data for Name: onjn_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onjn_reports (id, report_number, report_date, company_id, location_id, submission_date, notification_date, notification_type, notification_authority, commission_type, type, is_active, created_at, updated_at, status, created_by) FROM stdin;
\.


--
-- Data for Name: providers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.providers (id, name, company_name, contact_person, email, phone, address, city, country, website, is_active, created_at, updated_at, status) FROM stdin;
1	Provider Gaming SRL	Provider Gaming SRL	Maria Ionescu	contact@providergaming.ro	+40 987 654 321	Strada Provider, Nr. 456	Bucuresti	Romania	\N	t	2025-07-08 00:33:07.807102	2025-07-08 00:33:07.807102	active
2	Novomatic Gaming	\N	\N	contact@novomatic.com	+43 1 234 5678	Industriestraße 6-8, 2355 Wiener Neudorf, Austria	\N	\N	\N	t	2025-07-08 06:14:42.349225	2025-07-08 06:14:42.349225	active
3	IGT International	\N	\N	info@igt.com	+1 702 669 7777	9295 Prototype Court, Reno, NV 89521, USA	\N	\N	\N	t	2025-07-08 06:14:42.349988	2025-07-08 06:14:42.349988	active
4	Scientific Games	\N	\N	contact@sgc.com	+1 702 532 7000	6601 Bermuda Road, Las Vegas, NV 89119, USA	\N	\N	\N	t	2025-07-08 06:14:42.350711	2025-07-08 06:14:42.350711	active
\.


--
-- Data for Name: rent_agreements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rent_agreements (id, agreement_number, company_id, location_id, start_date, end_date, monthly_rent, security_deposit, terms, status, created_at, updated_at, landlord_name, tenant_name, property_address, currency, notes, created_by) FROM stdin;
1	RA-2024-001	5	3	2024-01-01 00:00:00	2024-12-31 00:00:00	1000.00	\N	\N	active	2025-07-08 06:19:13.333967	2025-07-08 06:19:13.333967	\N	\N	\N	\N	\N	\N
2	RA-2024-002	6	4	2024-01-01 00:00:00	2024-12-31 00:00:00	1250.00	\N	\N	active	2025-07-08 06:19:13.337334	2025-07-08 06:19:13.337334	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.slots (id, cabinet_id, game_mix_id, provider_id, location_id, exciter_type, denomination, max_bet, rtp, property_type, owner_id, serial_nr, invoice_id, commission_date, onjn_report_id, daily_revenue, year, gaming_places, is_active, created_at, updated_at, model, manufacturer, status) FROM stdin;
1	2	1	\N	\N	\N	\N	\N	\N	property	\N	NOV-SLOT-001	\N	\N	\N	\N	\N	\N	t	2025-07-08 06:17:23.305059	2025-07-08 06:17:23.305059	Book of Ra	\N	active
2	2	1	\N	\N	\N	\N	\N	\N	property	\N	NOV-SLOT-002	\N	\N	\N	\N	\N	\N	t	2025-07-08 06:17:23.307851	2025-07-08 06:17:23.307851	Lucky Lady's Charm	\N	active
3	3	2	\N	\N	\N	\N	\N	\N	property	\N	IGT-SLOT-001	\N	\N	\N	\N	\N	\N	t	2025-07-08 06:17:23.308741	2025-07-08 06:17:23.308741	Wheel of Fortune	\N	active
\.


--
-- Data for Name: user_locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_locations (id, user_id, location_id, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, telephone, password, first_name, last_name, role, is_active, created_at, updated_at) FROM stdin;
1	admin	admin@example.com	\N	$2b$10$Z2LInYKK.nXQXTj1O0jbNOta9q1RxwoYJUJZmpEy7R44A59MKe0Km	Admin	User	admin	t	2025-07-08 00:33:07.798707	2025-07-08 00:33:07.798707
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 1, false);


--
-- Name: attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attachments_id_seq', 1, false);


--
-- Name: cabinets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cabinets_id_seq', 4, true);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.companies_id_seq', 7, true);


--
-- Name: game_mixes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.game_mixes_id_seq', 4, true);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.invoices_id_seq', 2, true);


--
-- Name: legal_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.legal_documents_id_seq', 3, true);


--
-- Name: locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.locations_id_seq', 6, true);


--
-- Name: onjn_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.onjn_reports_id_seq', 1, false);


--
-- Name: providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.providers_id_seq', 4, true);


--
-- Name: rent_agreements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rent_agreements_id_seq', 2, true);


--
-- Name: slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.slots_id_seq', 3, true);


--
-- Name: user_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_locations_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: cabinets cabinets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cabinets
    ADD CONSTRAINT cabinets_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: game_mixes game_mixes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_mixes
    ADD CONSTRAINT game_mixes_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: legal_documents legal_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_documents
    ADD CONSTRAINT legal_documents_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: onjn_reports onjn_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onjn_reports
    ADD CONSTRAINT onjn_reports_pkey PRIMARY KEY (id);


--
-- Name: onjn_reports onjn_reports_report_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onjn_reports
    ADD CONSTRAINT onjn_reports_report_number_key UNIQUE (report_number);


--
-- Name: providers providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_pkey PRIMARY KEY (id);


--
-- Name: rent_agreements rent_agreements_agreement_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_agreements
    ADD CONSTRAINT rent_agreements_agreement_number_key UNIQUE (agreement_number);


--
-- Name: rent_agreements rent_agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_agreements
    ADD CONSTRAINT rent_agreements_pkey PRIMARY KEY (id);


--
-- Name: slots slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slots
    ADD CONSTRAINT slots_pkey PRIMARY KEY (id);


--
-- Name: user_locations user_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_locations
    ADD CONSTRAINT user_locations_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_activity_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs USING btree (created_at);


--
-- Name: idx_activity_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs USING btree (user_id);


--
-- Name: idx_companies_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_name ON public.companies USING btree (name);


--
-- Name: idx_invoices_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_company_id ON public.invoices USING btree (company_id);


--
-- Name: idx_locations_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_locations_company_id ON public.locations USING btree (company_id);


--
-- Name: idx_slots_location_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_slots_location_id ON public.slots USING btree (location_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: attachments attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: cabinets cabinets_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cabinets
    ADD CONSTRAINT cabinets_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: cabinets cabinets_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cabinets
    ADD CONSTRAINT cabinets_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id);


--
-- Name: game_mixes game_mixes_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_mixes
    ADD CONSTRAINT game_mixes_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id);


--
-- Name: invoices invoices_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: invoices invoices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: invoices invoices_seller_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_seller_company_id_fkey FOREIGN KEY (seller_company_id) REFERENCES public.companies(id);


--
-- Name: legal_documents legal_documents_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_documents
    ADD CONSTRAINT legal_documents_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: legal_documents legal_documents_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_documents
    ADD CONSTRAINT legal_documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: legal_documents legal_documents_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_documents
    ADD CONSTRAINT legal_documents_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: locations locations_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: locations locations_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id);


--
-- Name: onjn_reports onjn_reports_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onjn_reports
    ADD CONSTRAINT onjn_reports_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: onjn_reports onjn_reports_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onjn_reports
    ADD CONSTRAINT onjn_reports_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: onjn_reports onjn_reports_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onjn_reports
    ADD CONSTRAINT onjn_reports_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: rent_agreements rent_agreements_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_agreements
    ADD CONSTRAINT rent_agreements_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: rent_agreements rent_agreements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_agreements
    ADD CONSTRAINT rent_agreements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: rent_agreements rent_agreements_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_agreements
    ADD CONSTRAINT rent_agreements_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: slots slots_cabinet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slots
    ADD CONSTRAINT slots_cabinet_id_fkey FOREIGN KEY (cabinet_id) REFERENCES public.cabinets(id);


--
-- Name: slots slots_game_mix_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slots
    ADD CONSTRAINT slots_game_mix_id_fkey FOREIGN KEY (game_mix_id) REFERENCES public.game_mixes(id);


--
-- Name: slots slots_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slots
    ADD CONSTRAINT slots_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);


--
-- Name: slots slots_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slots
    ADD CONSTRAINT slots_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: slots slots_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slots
    ADD CONSTRAINT slots_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id);


--
-- Name: user_locations user_locations_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_locations
    ADD CONSTRAINT user_locations_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: user_locations user_locations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_locations
    ADD CONSTRAINT user_locations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

