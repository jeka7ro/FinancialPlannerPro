#!/bin/bash

echo "🚀 Deploying Financial Planner Pro to Render..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_error "Git repository not found. Please initialize git first:"
    echo "git init"
    echo "git add ."
    echo "git commit -m 'Initial commit'"
    exit 1
fi

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    print_warning "Render CLI not found. Installing..."
    curl -s https://render.com/download-cli/install.sh | bash
    print_success "Render CLI installed"
fi

print_status "Building frontend..."
cd client
npm install
npm run build
cd ..

print_status "Committing changes..."
git add .
git commit -m "Deploy to Render - Complete setup with online database"

print_status "Pushing to git..."
git push

print_success "Deploy initiated! Your services will be available at:"
echo ""
echo "🌐 Backend API: https://cashpot-backend.onrender.com"
echo "🎨 Frontend: https://cashpot-frontend.onrender.com"
echo ""
echo "📊 Database: PostgreSQL hosted on Render (persistent)"
echo "🔐 Admin login: admin / admin123"
echo ""
print_status "Deploy takes 5-10 minutes. Check Render dashboard for status."
print_status "All data will be saved online and accessible from anywhere!" 