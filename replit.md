# CASHPOT Gaming Management System

## Overview

This is a comprehensive gaming management system built for managing slot machines, cabinets, locations, and gaming operations. The application uses a full-stack TypeScript architecture with React frontend, Express.js backend, and PostgreSQL database with Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom gaming-specific color palette
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express session with PostgreSQL store
- **Authentication**: Session-based with bcrypt password hashing
- **API**: RESTful endpoints with JSON responses
- **Validation**: Zod schemas for request/response validation

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with TypeScript
- **Schema**: Comprehensive gaming industry schema including:
  - Users and role-based access control
  - Companies and locations management
  - Gaming providers and equipment tracking
  - Cabinet and slot machine inventory
  - Financial records (invoices, rent agreements)
  - Legal documents and ONJN reporting
  - Activity logging and audit trails

## Key Components

### Entity Management
- **Users**: Role-based user management (admin, operator, manager)
- **Companies**: Gaming company registration and management
- **Locations**: Physical location tracking with manager assignments
- **Providers**: Gaming software/hardware provider management
- **Cabinets**: Gaming cabinet inventory and status tracking
- **Game Mixes**: Game configuration and content management
- **Slots**: Individual slot machine tracking and assignment

### Financial Management
- **Invoices**: Revenue and expense tracking with PDF generation
- **Rent Agreements**: Location rental contract management
- **Legal Documents**: Contract and compliance document storage

### Compliance & Reporting
- **ONJN Reports**: Romanian gaming authority reporting
- **Activity Logs**: Comprehensive audit trail
- **System Alerts**: Real-time monitoring and notifications

### Dashboard Features
- **KPI Metrics**: Revenue, active equipment, location performance
- **Revenue Charts**: Visual performance analytics
- **Equipment Status**: Real-time cabinet and slot monitoring
- **Recent Activity**: System activity feed
- **Alert System**: Equipment and compliance notifications

## Data Flow

1. **Authentication Flow**: Session-based authentication with secure cookie storage
2. **API Communication**: RESTful APIs with JSON payloads and error handling
3. **Data Validation**: Client-side form validation with server-side schema validation
4. **State Management**: React Query handles caching, synchronization, and optimistic updates
5. **Real-time Updates**: Automatic data refresh and cache invalidation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm**: Type-safe database operations
- **express-session**: Session management
- **bcryptjs**: Password hashing
- **zod**: Schema validation
- **react-hook-form**: Form management
- **@tanstack/react-query**: Server state management

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **date-fns**: Date manipulation
- **next-themes**: Theme management

## Deployment Strategy

### Development
- **Environment**: Replit with Node.js 20
- **Database**: PostgreSQL 16 module
- **Build Process**: Vite dev server with HMR
- **Port**: 5000 (mapped to external port 80)

### Production
- **Build**: Vite static build + esbuild server bundle
- **Deployment**: Replit autoscale deployment
- **Database**: Neon serverless PostgreSQL
- **Session Store**: PostgreSQL session storage
- **Static Assets**: Served from dist/public

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `NODE_ENV`: Environment mode (development/production)

## User Preferences

- Preferred communication style: Simple, everyday language
- Login system: Includes "Remember me" option for extended 30-day sessions and credential storage
- Theme system: Multiple themes including Default, Light, Dark, macOS Monterey, and iCloud styles
- File attachments: Individual attachment buttons per row with popover interface
- Import/Export: Excel/CSV import and Excel/PDF export functionality with comprehensive templates and tutorials

## Recent Changes

- June 27, 2025: Completed comprehensive bulk operations implementation across Invoices, ONJN, and Legal modules with checkbox selection and bulk delete functionality
- June 27, 2025: Added server-side bulk delete routes (/api/invoices/bulk-delete, /api/onjn-reports/bulk-delete, /api/legal-documents/bulk-delete) with proper error handling
- June 27, 2025: Enhanced search functionality to filter across all columns in multiple modules with comprehensive OR conditions
- June 27, 2025: Created BulkOperations component for consistent UI patterns with select all, bulk edit, and bulk delete capabilities
- June 27, 2025: Fixed TypeScript errors and syntax issues in bulk operations implementation across all modules
- June 27, 2025: Implemented multiple location selection for invoice creation and editing with checkbox interface allowing selection of multiple locations per invoice
- June 27, 2025: Removed license date field from Invoice module completely - field no longer appears in create/edit forms or table display
- June 27, 2025: Updated database schema to replace single locationId with locationIds text field storing comma-separated location IDs
- June 27, 2025: Enhanced invoice table display to show multiple location names as comma-separated list instead of single location
- June 27, 2025: Updated server storage layer to convert location ID arrays to comma-separated strings for database storage and retrieval
- June 27, 2025: Modified invoice form validation schema to support array of location IDs with proper TypeScript types
- June 27, 2025: Implemented GroupedSerialNumbers component for efficient display of long serial number strings with automatic year-based grouping and range detection (e.g., "2016: 12-3227, 3430-3450")
- June 27, 2025: Replaced existing serial number displays in ONJN and Invoices modules with new GroupedSerialNumbers component for consistent grouped display
- June 27, 2025: Added smart serial number parsing that groups by year prefix and creates ranges for consecutive numbers (e.g., "1001-1005" instead of "1001, 1002, 1003, 1004, 1005")
- June 27, 2025: Enhanced ONJN module with comprehensive notification system featuring "New Notification" button with blue styling and bell icon
- June 27, 2025: Implemented notification form with authority selection (ONJN Central/Local), notification types, commission data selection, multiple location checkboxes, date fields, notes, and file attachments
- June 27, 2025: Standardized table structure across Invoice, Legal, and ONJN modules to match Slots format with ID, Created timestamp, and Created By user columns
- June 27, 2025: Added Export button to ONJN module header for consistency with other modules
- June 27, 2025: Fixed currency display in Invoice module - removed LEI currency symbol completely for cleaner presentation
- June 27, 2025: Added missing Seller Company field to invoice edit form for complete invoice management
- June 27, 2025: Enhanced ONJN module with complete table structure including ID, Created, Created By, and Attachments columns
- June 27, 2025: Implemented sortable ID columns across all modules with click-to-sort functionality
- June 27, 2025: Fixed ONJN module duplicate table issue by creating clean single-table implementation (ONJNClean.tsx)
- June 27, 2025: Updated Legal page to use LegalEnhanced.tsx with proper table view formatting matching other modules
- June 27, 2025: Applied consistent table styling with full-width display and proper overflow handling across Legal and ONJN modules
- June 27, 2025: Fixed critical Slots module edit functionality by implementing proper date validation and server-side date preprocessing for commission date field
- June 26, 2025: Successfully implemented actual provider logo display in Cabinets table using attachment system
- June 26, 2025: Provider logos now load from attachment system and display properly with white background for visibility
- June 26, 2025: Redesigned Slots table layout with user-requested column order: Slot ID (auto-increment), Provider, Cabinet, Game Mix, Location, etc.
- June 26, 2025: Added auto-increment Slot ID column (non-editable) as first column in Slots table
- June 26, 2025: Implemented sortable table headers for Slots module with click-to-sort functionality
- June 26, 2025: Removed revenue column from Slots table per user request
- June 26, 2025: Added backend sorting support for Slots API with sortField and sortDirection parameters
- June 26, 2025: Updated storage interface and implementation to support sorting by Slot ID
- June 26, 2025: Added Year and Gaming Places columns to Slots table with database schema updates
- June 26, 2025: Enhanced Slots table display with Year (year of manufacture) and Gaming Places (number) columns
- June 26, 2025: Updated Slots create and edit forms to include Year and Gaming Places input fields
- June 26, 2025: Enhanced Slots search functionality to include Year and Gaming Places fields
- June 26, 2025: Implemented ProviderLogo component with proper attachment loading and fallback to initials
- June 26, 2025: Added locations query to Slots module to support location display in table
- June 26, 2025: Cleaned up debug console logs after successful provider logo implementation
- June 26, 2025: Implemented compact serial numbers display in Invoice and ONJN tables - shows "multiple serials (count)" with click-to-expand popover
- June 26, 2025: Enhanced table layouts with clean serial number display that maintains readability while providing full access to all serial numbers
- June 26, 2025: Removed sorting button icons while maintaining click-to-sort functionality across all modules per user request
- June 26, 2025: Fixed Light theme implementation with proper light mode styling for glass effects and sidebar
- June 26, 2025: Improved left-alignment of all tables and content throughout the application
- June 26, 2025: Fixed ONJN license commission deletion foreign key constraint errors
- June 26, 2025: Fixed Slots module numeric field validation errors by adding server-side preprocessing to convert empty strings to null values
- June 26, 2025: Applied numeric field preprocessing to both create and update slot operations for Year, Gaming Places, and RTP fields
- June 26, 2025: CRITICAL FIX - Implemented full-width table layout using calc(100vw - 280px) to maximize table space usage across all modules
- June 26, 2025: Removed table-layout: fixed and width constraints (w-16, w-24, etc.) from table headers to allow dynamic column sizing
- June 26, 2025: Applied comprehensive table width expansion to Slots, Providers, and Cabinets modules with consistent styling
- June 26, 2025: Redesigned Cabinet module layout with Provider column first (with logo placeholders) and Cabinet Name second column
- June 26, 2025: Made serial number field optional and removed from forms per user requirements
- June 26, 2025: Removed installation date field from Cabinet module completely - from database schema, forms, table display, and export templates
- June 26, 2025: Enhanced provider display in Cabinets table with better error handling and fallback text
- June 26, 2025: Fixed duplicate "Cabinets" heading by removing redundant page title
- June 26, 2025: Enhanced logo display with fallback text and improved error handling
- June 26, 2025: Removed Serial Number and Manufacturer fields from Cabinet module as previously requested
- June 26, 2025: Fixed duplicate "Cabinets" headings in Cabinets page to eliminate tripled display issue
- June 26, 2025: Updated logo display in sidebar with proper Vite asset handling and error handling
- June 26, 2025: Completed comprehensive action button implementation across all modules with working edit and delete functionality
- June 26, 2025: Added proper Edit and Trash2 icons from Lucide React throughout entire application
- June 26, 2025: Implemented delete mutations with confirmation dialogs and error handling for all data tables
- June 26, 2025: Fixed TypeScript errors in form handling and ensured consistent UI patterns across modules
- June 26, 2025: Enhanced user management with comprehensive contact information including email, telephone, and photo fields
- June 26, 2025: Added telephone column to Users table display for complete contact visibility
- June 26, 2025: Created UserAvatar component with photo display functionality and fallback initials
- June 26, 2025: Updated header to display current user's photo and information in upper right corner
- June 26, 2025: Implemented user photo display throughout Users table with proper fallback handling
- June 26, 2025: Fixed user editing functionality by adding proper onClick handlers to edit buttons
- June 26, 2025: Added getAttachment method to storage interface for file attachment operations
- June 26, 2025: Removed billing system components per user request - user confirmed they don't need billing reports functionality
- June 26, 2025: Cleaned up navigation and codebase to focus on core gaming management features
- June 26, 2025: Completed user photo upload functionality using attachment system instead of URL fields
- June 26, 2025: Enhanced UserAvatar component to load and display photos from attachments with proper fallback handling
- June 26, 2025: Updated header to show current user's photo using new UserAvatar component
- June 26, 2025: Removed photo field from user schema in favor of file attachment system for better security
- June 26, 2025: Fixed photo display errors with proper null checking for fileName property
- June 26, 2025: Updated user avatars to circular shape with proper fill and doubled size for better visibility
- June 26, 2025: Refined user avatars to smaller circular size with transparent background and optimized photo display
- June 26, 2025: Fixed auto-filling of phone and email fields in Locations module when manager is selected
- June 26, 2025: Fixed HTTP method parameter order error in Providers module apiRequest calls
- June 26, 2025: Implemented comprehensive search functionality across all modules - search now filters by any information found in any columns
- June 26, 2025: RESOLVED - Successfully implemented table positioning aligned with left sidebar edge
- June 26, 2025: Used CSS Grid layout with grid-cols-[256px_1fr] to achieve exact positioning
- June 26, 2025: Tables now start immediately at sidebar edge (256px) and extend to full screen width
- June 26, 2025: Applied negative margins to table containers for precise alignment
- June 26, 2025: Optimized table column visibility to prevent unnecessary horizontal scrollbars
- June 26, 2025: Added auto table layout and proper cell padding for optimal content display
- June 26, 2025: Fixed search bar functionality across all modules with proper URL encoding
- June 26, 2025: Resolved sidebar logo positioning issues - text no longer overlaps with logo
- June 26, 2025: Enhanced sidebar navigation with proper z-index and text truncation
- June 26, 2025: Applied search fixes to Providers, Cabinets, Slots, Locations, Users, Companies, and Invoices modules
- June 26, 2025: Enhanced backend search logic to use OR conditions across all relevant fields for each entity type
- June 26, 2025: Updated Users search to filter by username, email, firstName, lastName, and role
- June 26, 2025: Updated Companies search to filter by name, taxId, address, city, country, phone, email, and website
- June 26, 2025: Updated Locations search to filter by name, address, city, country, phone, and email
- June 26, 2025: Updated Providers search to filter by name, companyName, contactPerson, email, phone, address, city, country, and website
- June 26, 2025: Updated Cabinets search to filter by serialNumber, model, manufacturer, and status
- June 26, 2025: Updated Game Mixes search to filter by name and description
- June 26, 2025: Updated Slots search to filter by serialNr, exciterType, and propertyType
- June 26, 2025: Updated Invoices search to filter by invoiceNumber, status, serialNumbers, propertyType, and notes
- June 26, 2025: Updated Rent Agreements search to filter by agreementNumber and status
- June 26, 2025: Updated Legal Documents search to filter by title, documentType, and status
- June 26, 2025: Updated ONJN Reports search to filter by serialNumbers and notes
- June 26, 2025: Fixed missing edit dialog functionality in Invoices module with complete form fields
- June 26, 2025: Added missing users query to Locations module for manager selection functionality
- June 26, 2025: Fixed provider edit functionality by correcting HTTP method from PATCH to PUT to match server routes
- June 26, 2025: Fixed company name display in Locations table to show actual company names instead of "Company X"
- June 25, 2025: Transformed ONJN module from report types to license commission functionality with commission dates and serial numbers
- June 25, 2025: Added automatic commission date lookup in Slots module displaying dates when serial numbers match ONJN commissions
- June 25, 2025: Updated database schema for license commissions with commission_date, serial_numbers, and notes fields
- June 25, 2025: Enhanced ONJN module with file attachment support and complete CRUD operations for license commissions
- June 25, 2025: Implemented automatic invoice number lookup in Slots module based on serial number matching
- June 25, 2025: Slots now automatically display invoice numbers when slot serial number matches any serial number in invoices
- June 25, 2025: Fixed duplicate variable declarations and TypeScript errors in Slots module
- June 25, 2025: Added Serial Number and License Date fields to Invoices module with ONJN integration
- June 25, 2025: Added Amortization field (months) and Property Type field to Invoices module
- June 25, 2025: Implemented file attachment functionality for Invoices with PDF, XLS, PNG, JPEG support
- June 25, 2025: Enhanced Invoices table with Serial Numbers badges, License Date, Amortization, and Property Type columns
- June 25, 2025: Completed comprehensive TypeScript error resolution across all modules
- June 25, 2025: Created formUtils.ts utility with safeFormValue, safeNumericValue, and parseNullableNumber functions
- June 25, 2025: Applied null safety pattern `value={field.value || ""}` to all form inputs throughout application
- June 25, 2025: Systematically fixed form inputs in Companies, Providers, Locations, Cabinets, GameMixes, Invoices, Users, Slots, RentManagement, and Settings modules
- June 25, 2025: Achieved full TypeScript compliance with proper null value handling for React form components
- June 25, 2025: Implemented comprehensive bulk operations (select, edit, delete) across all major modules
- June 25, 2025: Added individual row checkboxes and select-all functionality to data tables
- June 25, 2025: Created BulkOperations component for consistent UI patterns across modules
- June 25, 2025: Enhanced table layouts with bulk selection capabilities and toast notifications
- December 25, 2024: Added comprehensive import/export functionality with detailed templates and tutorial PDF
- December 25, 2024: Created export templates with sample data and field descriptions for all modules
- December 25, 2024: Implemented file attachment system with individual row-level attachment buttons
- December 25, 2024: Added "Remember me" login option for extended 30-day sessions and credential storage
- December 25, 2024: Removed "ERP" branding, updated to "CASHPOT" throughout application
- December 25, 2024: Implemented comprehensive theme system with 5 themes: Default, Light, Dark, macOS Monterey, and iCloud
- June 25, 2025: Added comprehensive file attachment system to all modules with preview and download capabilities
- June 25, 2025: Implemented AttachmentButton component with upload, preview, and download functionality for all entities
- June 25, 2025: Enhanced server routes with file upload, download, and deletion endpoints with proper error handling
- June 25, 2025: Initial setup with complete gaming management system
- June 25, 2025: Removed "2.0" from CASHPOT branding throughout application