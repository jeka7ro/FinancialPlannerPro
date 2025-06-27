# CASHPOT Gaming Management System

A comprehensive gaming management system built for ONJN (National Gambling Office) reporting and regulatory compliance in the Romanian gaming industry.

## 🎯 Overview

CASHPOT is a full-stack TypeScript application designed for managing slot machines, cabinets, locations, and gaming operations with advanced compliance and reporting features.

### Key Features

- **Complete Gaming Equipment Management** - Track slots, cabinets, providers, and game mixes
- **Location & Company Management** - Manage gaming locations with company assignments
- **Financial Operations** - Handle invoices, rent agreements, and financial reporting
- **ONJN Compliance** - Romanian gaming authority reporting and license commission tracking
- **Legal Document Management** - Store and manage contracts and compliance documents
- **User Management** - Role-based access control (admin, operator, manager)
- **Import/Export Functionality** - Excel/CSV import and Excel/PDF export capabilities
- **Real-time Dashboard** - KPI metrics, revenue charts, and equipment monitoring

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and HMR
- **Shadcn/ui** components built on Radix UI
- **Tailwind CSS** for styling
- **TanStack Query** for server state management
- **Wouter** for client-side routing
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **PostgreSQL** database with Neon serverless
- **Drizzle ORM** for type-safe database operations
- **Session-based authentication** with bcrypt
- **File upload/attachment system**

### Database
- **PostgreSQL 16** with comprehensive gaming industry schema
- **Drizzle ORM** migrations and type safety
- **Session storage** in PostgreSQL
- **File attachments** with metadata tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Environment variables configuration

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cashpot-gaming-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   SESSION_SECRET=your-session-secret-key
   NODE_ENV=development
   ```

4. **Database setup**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components and routes
│   │   ├── lib/            # Utilities and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express backend application
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── services/           # Business logic services
│   └── index.ts            # Server entry point
├── shared/                 # Shared TypeScript types and schemas
│   └── schema.ts           # Database schema and Zod validations
├── uploads/                # File attachment storage
└── package.json            # Dependencies and scripts
```

## 🎮 Core Modules

### Equipment Management
- **Slots** - Individual slot machine tracking with auto-increment IDs
- **Cabinets** - Gaming cabinet inventory with provider logos
- **Providers** - Gaming software/hardware provider management
- **Game Mixes** - Game configuration and content management

### Business Operations
- **Companies** - Gaming company registration and management
- **Locations** - Physical location tracking with manager assignments
- **Users** - Role-based user management with photo support
- **Invoices** - Revenue tracking with multi-location support

### Compliance & Legal
- **ONJN Reports** - Romanian gaming authority license commission reporting
- **Legal Documents** - Contract and compliance document storage
- **Rent Agreements** - Location rental contract management
- **Activity Logs** - Comprehensive audit trail

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

## 🎨 Features

### Advanced UI/UX
- **Multiple Themes** - Default, Light, Dark, macOS Monterey, iCloud styles
- **Responsive Design** - Optimized for desktop and tablet use
- **Consistent Styling** - Standardized button positioning and gradient styling
- **User-Friendly Tables** - Row numbering, sorting, and full-width layouts

### Data Management
- **Bulk Operations** - Select all, bulk edit, and bulk delete capabilities
- **Advanced Search** - Filter across all columns in each module
- **Import/Export** - Excel/CSV import with comprehensive templates
- **File Attachments** - Individual attachment support per entity

### Dashboard & Analytics
- **KPI Metrics** - Revenue, active equipment, location performance
- **Visual Charts** - Revenue analytics and performance tracking
- **Real-time Monitoring** - Equipment status and system alerts
- **Activity Feed** - Recent system activity and changes

## 🔐 Authentication & Security

- **Session-based Authentication** - Secure cookie-based sessions
- **Role-based Access Control** - Admin, operator, and manager roles
- **Password Security** - bcrypt hashing with salt rounds
- **Remember Me** - Extended 30-day session option
- **CSRF Protection** - Built-in session security

## 📊 Database Schema

The system includes comprehensive database schemas for:

- User management with roles and permissions
- Company and location hierarchies
- Gaming equipment with full lifecycle tracking
- Financial records with multi-location support
- Legal compliance documentation
- Audit logs and activity tracking

## 🌐 Deployment

### Production Build

```bash
npm run build
```

### Environment Configuration

Ensure the following environment variables are set:

```env
DATABASE_URL=postgresql://production-url
SESSION_SECRET=production-secret
NODE_ENV=production
```

### Recommended Hosting

- **Frontend**: Vercel, Netlify, or similar static hosting
- **Backend**: Railway, Render, or traditional VPS
- **Database**: Neon, Supabase, or managed PostgreSQL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the import/export templates and tutorials

## 🚀 Recent Updates

- ✅ Comprehensive button standardization across all modules
- ✅ Complete export functionality for all data modules
- ✅ Enhanced ONJN reporting with notification system
- ✅ Multi-location invoice support
- ✅ Grouped serial number display optimization
- ✅ User photo management with attachment system

---

**Built with ❤️ for the Romanian gaming industry**