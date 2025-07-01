#!/bin/bash

# CASHPOT ERP System Backup Script
# Created: $(date)
# This script creates a comprehensive backup of the entire system

set -e  # Exit on any error

echo "🔄 Starting CASHPOT ERP System Backup..."

# Create backups directory if it doesn't exist
mkdir -p backups

# Create backup directory with timestamp in the backups folder
BACKUP_DIR="backups/CASHPOT_BACKUP_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Created backup directory: $BACKUP_DIR"

# 1. Create database backup
echo "🗄️  Creating database backup..."
if command -v pg_dump &> /dev/null; then
    pg_dump -h localhost -U postgres -d cashpot_development --no-password > "$BACKUP_DIR/database_backup.sql" 2>/dev/null || echo "⚠️  Database backup failed (may not be running)"
else
    echo "⚠️  pg_dump not found, skipping database backup"
fi

# 2. Copy all project files (excluding node_modules, .git, and backups folder for size)
echo "📦 Copying project files..."
rsync -av --exclude='node_modules' --exclude='.git' --exclude='*.log' --exclude='backups' . "$BACKUP_DIR/project_files/"

# 3. Copy environment file if it exists
if [ -f ".env" ]; then
    echo "🔐 Backing up environment configuration..."
    cp .env "$BACKUP_DIR/environment.env"
fi

# 4. Create a backup info file
echo "📝 Creating backup documentation..."
cat > "$BACKUP_DIR/BACKUP_INFO.md" << EOF
# CASHPOT ERP System Backup

**Created:** $(date)
**System:** CASHPOT ERP 2.0 - Professional Gaming Management System
**Repository:** https://github.com/jeka7ro/FinancialPlannerPro

## Backup Contents

### 1. Database Backup
- File: \`database_backup.sql\`
- Database: PostgreSQL (cashpot_development)
- Restore command: \`psql -h localhost -U postgres -d cashpot_development < database_backup.sql\`

### 2. Project Files
- Location: \`project_files/\`
- Includes: All source code, configurations, assets
- Excludes: node_modules, .git, logs (for size optimization)

### 3. Environment Configuration
- File: \`environment.env\`
- Contains: Database URLs, session secrets, API keys

## System Features Included

✅ **Core Business Modules:**
- Companies Management
- Locations Management  
- Providers Management
- Users Management
- Gaming Equipment (Slots, Cabinets, Game Mixes)
- Financial Management (Invoices, Rent Management)
- Legal Compliance (ONJN Reports, Legal Documents)

✅ **Technical Features:**
- PostgreSQL Database Integration
- React + TypeScript Frontend
- Express.js Backend API
- Authentication & Session Management
- File Upload & Attachment System
- Professional Glass Morphism UI
- Responsive Design System

✅ **Enhanced Features:**
- Consistent dialog sizing across all modules
- Professional table layouts with glass effects
- Advanced search and filtering capabilities
- Bulk operations support
- Comprehensive error handling
- Modern gaming industry-appropriate design

## Restoration Instructions

1. **Setup Environment:**
   \`\`\`bash
   cd project_files/
   npm install
   \`\`\`

2. **Restore Database:**
   \`\`\`bash
   createdb cashpot_development
   psql -h localhost -U postgres -d cashpot_development < ../database_backup.sql
   \`\`\`

3. **Configure Environment:**
   \`\`\`bash
   cp ../environment.env .env
   \`\`\`

4. **Start System:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Access Application:**
   - URL: http://localhost:3001
   - Admin Login: admin / admin123

## Support
For technical support or questions about this backup, refer to the project documentation or GitHub repository.
EOF

# 5. Create project archive
echo "🗜️  Creating compressed archive..."
tar -czf "${BACKUP_DIR}.tar.gz" "$BACKUP_DIR"

# 6. Calculate sizes
PROJECT_SIZE=$(du -sh . | cut -f1)
BACKUP_SIZE=$(du -sh "${BACKUP_DIR}.tar.gz" | cut -f1)

echo ""
echo "✅ Backup completed successfully!"
echo "📊 Backup Summary:"
echo "   📁 Original project size: $PROJECT_SIZE"
echo "   📦 Compressed backup size: $BACKUP_SIZE"
echo "   📍 Backup location: $(pwd)/${BACKUP_DIR}.tar.gz"
echo "   🌐 Remote backup: https://github.com/jeka7ro/FinancialPlannerPro"
echo ""
echo "🔐 Your CASHPOT ERP system is now safely backed up!"
echo "💡 To restore, extract the archive and follow instructions in BACKUP_INFO.md"

# Optional: Clean up uncompressed backup directory
read -p "🗑️  Remove uncompressed backup directory? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf "$BACKUP_DIR"
    echo "🧹 Cleaned up temporary files"
fi

echo "🎉 Backup process complete!" 