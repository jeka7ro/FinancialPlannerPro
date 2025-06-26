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