#!/bin/bash

# Gyaan Buddy Setup Script
# This script helps you set up the development environment

echo "🚀 Gyaan Buddy Setup Script"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo "   Node version: $(node --version)"
echo "   npm version: $(npm --version)"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""

# Check environment variables
echo "🔧 Checking environment configuration..."
if grep -q "REACT_APP_USE_MOCK_DATA=true" .env; then
    echo "✅ Mock data is enabled (development mode)"
else
    echo "⚠️  Mock data is disabled (will use real API)"
fi

if grep -q "REACT_APP_API_URL=http://localhost:3001/api" .env; then
    echo "✅ API URL is set to localhost (development)"
else
    echo "⚠️  API URL is set to production or custom endpoint"
fi

echo ""

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p src/data
mkdir -p src/services
mkdir -p public/images
echo "✅ Directories created"

echo ""

# Display next steps
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Start the development server:"
echo "   npm start"
echo ""
echo "2. Open your browser and go to:"
echo "   http://localhost:3000"
echo ""
echo "3. Access the API Logic Screen:"
echo "   http://localhost:3000/api-logic"
echo ""
echo "4. To switch to real API (when backend is ready):"
echo "   - Update REACT_APP_USE_MOCK_DATA=false in .env"
echo "   - Update REACT_APP_API_URL to your backend URL"
echo ""
echo "📚 Documentation:"
echo "   - API Documentation: API_DOCUMENTATION.md"
echo "   - Environment Config: ENVIRONMENT_CONFIG.md"
echo "   - Implementation Summary: IMPLEMENTATION_SUMMARY.md"
echo ""
echo "Happy coding! 🚀"
