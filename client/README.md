# Financial Planner Pro - Frontend

A comprehensive gaming management system built with React, TypeScript, and Vite.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## 🔐 Authentication

The application now requires proper authentication. Use the following demo credentials:

### Demo Users

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `admin` | `admin123` | Admin | Full system access |
| `manager1` | `manager123` | Manager | Management access |
| `operator1` | `operator123` | Operator | Basic operations |

### Login Instructions

1. Navigate to the application
2. You will be redirected to the login page
3. Enter your credentials
4. Click "Sign In"
5. You will be redirected to the dashboard

### Security Features

- **No Auto-Login**: Users must explicitly log in with valid credentials
- **Session Management**: Proper session handling with logout functionality
- **Role-Based Access**: Different user roles with appropriate permissions
- **Secure Logout**: Complete session termination on logout

## 🎮 Features

### Dashboard
- Real-time gaming statistics
- Interactive location map
- Financial metrics and analytics
- System alerts and notifications

### Management Modules
- **Companies**: Gaming company management
- **Locations**: Venue and facility tracking
- **Providers**: Equipment and service providers
- **Cabinets**: Gaming cabinet inventory
- **Game Mixes**: Game configurations
- **Slots**: Slot machine management
- **Invoices**: Financial invoicing system
- **Users**: User account management
- **Legal**: Compliance documentation
- **ONJN**: Romanian gambling authority compliance

### Data Management
- Comprehensive mock data system
- Realistic Romanian gaming industry data
- Pagination and search functionality
- Export and reporting capabilities

## 🎨 Design

- **Dark Gaming Theme**: Professional gaming aesthetic
- **Glass Morphism**: Modern UI with glass effects
- **Responsive Design**: Works on all devices
- **Interactive Elements**: Hover effects and animations

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Routing**: Wouter
- **UI Components**: Custom components with shadcn/ui
- **Maps**: Leaflet with React-Leaflet

## 📊 Mock Data

The application includes comprehensive mock data for demonstration:

- **5 Gaming Companies** with realistic Romanian data
- **6 Locations** across major Romanian cities
- **6 Gaming Slots** with detailed specifications
- **6 Users** with different roles
- **6 Invoices** with various payment statuses
- **3 Providers** (Novomatic, IGT, Aristocrat)
- **3 Game Mixes** with different configurations
- **3 Cabinets** with status tracking

## 🔧 Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Financial Planner Pro
```

### Build Configuration
- **Output**: `dist/` directory
- **Assets**: Optimized for production
- **Source Maps**: Disabled for production

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

### Other Platforms
- **Netlify**: Use `dist` as publish directory
- **GitHub Pages**: Deploy from `dist` folder
- **Docker**: Use multi-stage build with Node.js

## 📝 Development Notes

- **Mock API**: Frontend-only deployment with comprehensive mock data
- **Type Safety**: Full TypeScript implementation
- **Performance**: Optimized bundle with code splitting
- **Accessibility**: WCAG compliant components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
