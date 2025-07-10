# Financial Planner Pro - Technical Specification Document

## Executive Summary

Financial Planner Pro is a comprehensive gaming management system designed for the Romanian gaming industry, specifically built to handle ONJN (Oficiul Național pentru Jocuri de Noroc) compliance requirements. The system manages gaming companies, locations, equipment, financial operations, and regulatory reporting in a multi-user, cloud-based environment.

## System Overview

### Purpose
The application serves as a complete management platform for gaming operators, providing:
- Multi-location gaming facility management
- Equipment inventory and tracking
- Financial management and invoicing
- Regulatory compliance and reporting
- User access control and role-based permissions
- Real-time data synchronization across all devices

### Target Users
- **Gaming Company Administrators**: Full system access
- **Location Managers**: Location-specific data access
- **Operators**: Basic operational access
- **Compliance Officers**: Regulatory reporting access

## Technical Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom gaming-specific design system
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Vercel (static hosting)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express session with PostgreSQL store
- **Authentication**: Session-based with bcrypt password hashing
- **API**: RESTful endpoints with JSON responses
- **Validation**: Zod schemas for request/response validation
- **File Storage**: Database-based storage (base64/text) for online sync
- **Deployment**: Render (serverless/container hosting)

### Database Architecture
- **Database**: PostgreSQL (configured for cloud deployment)
- **ORM**: Drizzle ORM with TypeScript
- **Migrations**: Automated schema migrations
- **Connection Pooling**: Optimized for cloud deployment

## Core Features and Requirements

### 1. Authentication & Authorization System

#### User Management
- **User Registration**: Admin-only user creation
- **Role-Based Access Control**: Admin, Manager, Operator roles
- **Session Management**: Secure session handling with automatic expiration
- **Password Security**: Bcrypt hashing with salt

#### Authentication Flow
1. User navigates to application
2. Redirected to login page if not authenticated
3. Enter username/password credentials
4. Server validates credentials against database
5. Session created and stored in PostgreSQL
6. User redirected to dashboard
7. Session maintained across browser tabs/devices

#### Authorization Matrix
| Role | Companies | Locations | Equipment | Financial | Users | Reports |
|------|-----------|-----------|-----------|-----------|-------|---------|
| Admin | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| Manager | Read Only | Assigned Only | Assigned Only | Assigned Only | Read Only | Assigned Only |
| Operator | Read Only | Assigned Only | Read Only | Read Only | None | Read Only |

### 2. Company Management Module

#### Requirements
- Create, read, update, delete gaming companies
- Store company registration details
- Track company status (active/inactive)
- Associate companies with locations
- Upload company logos and documents

#### Data Fields
- Company name, registration number, tax ID
- Contact information (address, phone, email, website)
- Contact person details
- Status tracking
- Creation and modification timestamps

#### Business Rules
- Company names must be unique
- Registration numbers must be valid format
- Active companies cannot be deleted
- Location assignments must be validated

### 3. Location Management Module

#### Requirements
- Manage gaming venues and facilities
- Geographic location tracking with coordinates
- Manager assignments per location
- Status tracking (active/inactive)
- Document and attachment management

#### Data Fields
- Location name, address, city, county, country
- Geographic coordinates (latitude/longitude)
- Contact information
- Manager assignment
- Postal code and status
- Associated company

#### Business Rules
- Each location must have a manager assigned
- Geographic coordinates auto-generated from address
- Location status affects equipment visibility
- Manager can only access assigned locations

### 4. Equipment Management System

#### Cabinet Management
- **Requirements**: Track gaming cabinets and hardware
- **Data Fields**: Serial number, model, manufacturer, provider, location
- **Features**: Maintenance scheduling, revenue tracking, status monitoring
- **Business Rules**: Serial numbers must be unique, cabinets must be assigned to locations

#### Slot Machine Management
- **Requirements**: Individual slot machine tracking
- **Data Fields**: Model, denomination, max bet, RTP, gaming places
- **Features**: Commission date tracking, ONJN reporting integration
- **Business Rules**: Slots must be linked to cabinets and game mixes

#### Game Mix Management
- **Requirements**: Configure game collections for cabinets
- **Data Fields**: Name, description, game list, provider association
- **Features**: Game count tracking, configuration management
- **Business Rules**: Game mixes must be associated with providers

### 5. Provider Management Module

#### Requirements
- Manage gaming software and hardware providers
- Track provider contact information
- Associate providers with equipment
- Upload provider logos and documentation

#### Data Fields
- Provider name, company name, contact person
- Contact information (email, phone, address)
- Website and status
- Associated equipment tracking

#### Business Rules
- Provider names must be unique
- Active providers cannot be deleted if equipment exists
- Contact information validation required

### 6. Financial Management System

#### Invoice Management
- **Requirements**: Create and track financial invoices
- **Data Fields**: Invoice number, dates, amounts, serial numbers
- **Features**: Payment status tracking, amortization calculation
- **Business Rules**: Invoice numbers must be unique, amounts must be positive

#### Rent Management
- **Requirements**: Track rental agreements for locations
- **Data Fields**: Agreement number, dates, amounts, terms
- **Features**: Payment tracking, agreement status monitoring
- **Business Rules**: Agreement dates must be valid, amounts must be positive

#### Automated Billing System
- **Requirements**: Generate bills based on billing plans
- **Features**: Revenue share calculations, minimum guarantees
- **Business Rules**: Billing schedules must be configured, payments must be tracked

### 7. Legal Compliance Module

#### Legal Documents
- **Requirements**: Store and manage legal documentation
- **Data Fields**: Title, type, dates, authority, status
- **Features**: Document upload, expiry tracking, status monitoring
- **Business Rules**: Documents must have valid dates, status tracking required

#### ONJN Reporting
- **Requirements**: Romanian gambling authority compliance
- **Data Fields**: Report details, dates, serial numbers, status
- **Features**: Report generation, status tracking, commission date management
- **Business Rules**: Reports must include valid equipment data, dates must be accurate

### 8. File Attachment System

#### Requirements
- Upload and store files for all entities
- Support multiple file types (images, documents, PDFs)
- Online synchronization across all devices
- Secure file access and permissions

#### Technical Implementation
- Files stored as base64/text in database for online sync
- File size limits (50MB per file)
- MIME type validation
- Entity-specific attachment organization

#### Business Rules
- Files must be associated with specific entities
- Upload permissions based on user role
- File access controlled by entity permissions

### 9. Dashboard and Analytics

#### Requirements
- Real-time overview of system status
- Key performance indicators
- Interactive location map
- Recent activity tracking

#### Features
- Financial metrics display
- Equipment status overview
- Location performance tracking
- System alerts and notifications

### 10. Import/Export System

#### Requirements
- Bulk data import from Excel files
- Data export for reporting
- Template generation for imports
- Validation and error handling

#### Supported Formats
- Excel (.xlsx, .xls)
- CSV files
- PDF reports

## User Interface Requirements

### Design System
- **Theme**: Dark gaming aesthetic with glass morphism effects
- **Colors**: Professional gaming industry color palette
- **Typography**: Modern, readable fonts
- **Icons**: Lucide React icon set
- **Responsive**: Mobile-first responsive design

### Navigation Structure
- **Sidebar Navigation**: Main module access
- **Breadcrumb Navigation**: Page hierarchy
- **Search Functionality**: Global search across entities
- **Quick Actions**: Common tasks accessible from dashboard

### Component Requirements
- **Tables**: Sortable, filterable, paginated data tables
- **Forms**: Validated input forms with error handling
- **Modals**: Dialog-based editing and creation
- **Cards**: Information display with glass effects
- **Charts**: Data visualization components

## API Requirements

### RESTful Endpoints
All endpoints follow REST conventions with proper HTTP methods:

#### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/user` - Current user information

#### Entity Management Endpoints
- `GET /api/{entity}` - List entities with pagination
- `POST /api/{entity}` - Create new entity
- `GET /api/{entity}/:id` - Get specific entity
- `PUT /api/{entity}/:id` - Update entity
- `DELETE /api/{entity}/:id` - Delete entity

#### File Management Endpoints
- `POST /api/{entityType}/{entityId}/attachments` - Upload file
- `GET /api/{entityType}/{entityId}/attachments` - List files
- `DELETE /api/attachments/:id` - Delete file

### Response Format
```json
{
  "data": {...},
  "message": "Success message",
  "errors": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Error Handling
- Standard HTTP status codes
- Detailed error messages
- Validation error arrays
- Consistent error response format

## Security Requirements

### Authentication Security
- Session-based authentication
- Secure password hashing (bcrypt)
- Session timeout and renewal
- CSRF protection

### Authorization Security
- Role-based access control
- Entity-level permissions
- Location-based data filtering
- Admin-only operations protection

### Data Security
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Secure file upload validation

### Deployment Security
- HTTPS enforcement
- Environment variable protection
- Database connection security
- CORS configuration

## Performance Requirements

### Response Times
- Page load: < 3 seconds
- API responses: < 1 second
- File uploads: < 30 seconds (50MB files)
- Search operations: < 2 seconds

### Scalability
- Support for 100+ concurrent users
- Database optimization for large datasets
- Efficient pagination and filtering
- Caching strategies for frequently accessed data

### Availability
- 99.9% uptime requirement
- Graceful error handling
- Automatic retry mechanisms
- Health check endpoints

## Data Management Requirements

### Data Integrity
- Foreign key constraints
- Unique constraint validation
- Data type validation
- Business rule enforcement

### Data Backup
- Automated database backups
- File attachment backups
- Configuration backup
- Disaster recovery procedures

### Data Migration
- Schema migration support
- Data import/export capabilities
- Version compatibility
- Rollback procedures

## Deployment Requirements

### Environment Configuration
- Environment-specific settings
- Database connection management
- File storage configuration
- Logging and monitoring setup

### Deployment Process
- Automated build and deployment
- Environment variable management
- Database migration execution
- Health check validation

### Monitoring and Logging
- Application performance monitoring
- Error tracking and alerting
- User activity logging
- System health monitoring

## Compliance Requirements

### Romanian Gaming Regulations
- ONJN reporting compliance
- Equipment registration requirements
- Financial reporting standards
- Audit trail maintenance

### Data Protection
- GDPR compliance for EU users
- Data retention policies
- User consent management
- Data export capabilities

### Audit Requirements
- Complete activity logging
- User action tracking
- Data modification history
- Compliance report generation

## Integration Requirements

### External Services
- Geocoding service for address coordinates
- Email service for notifications
- File storage service (optional)
- Payment processing (future)

### API Integrations
- ONJN API integration (future)
- Banking API integration (future)
- Equipment manufacturer APIs (future)

## Testing Requirements

### Unit Testing
- Component testing
- Service layer testing
- Database operation testing
- Utility function testing

### Integration Testing
- API endpoint testing
- Database integration testing
- File upload testing
- Authentication flow testing

### User Acceptance Testing
- Role-based access testing
- Business workflow testing
- Data validation testing
- Performance testing

## Documentation Requirements

### Technical Documentation
- API documentation
- Database schema documentation
- Deployment guides
- Troubleshooting guides

### User Documentation
- User manual
- Feature guides
- Video tutorials
- FAQ documentation

### Maintenance Documentation
- System administration guide
- Backup and restore procedures
- Update and migration guides
- Security procedures

## Future Enhancement Requirements

### Planned Features
- Mobile application development
- Advanced analytics and reporting
- Automated compliance checking
- Multi-language support
- Advanced billing automation

### Scalability Planning
- Microservices architecture consideration
- Database sharding strategies
- CDN integration for file delivery
- Advanced caching implementations

## Conclusion

This technical specification provides a comprehensive framework for the Financial Planner Pro application, ensuring it meets all requirements for multi-user online deployment while maintaining security, performance, and compliance standards. The system is designed to be scalable, maintainable, and user-friendly while providing robust functionality for gaming industry management and regulatory compliance. 