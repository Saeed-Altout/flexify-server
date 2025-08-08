#!/bin/bash

# Development Setup Script for Flexify Auth Service

echo "🚀 Setting up Flexify Auth Service for development..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your Supabase credentials."
else
    echo "✅ .env file already exists."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run formatting
echo "🎨 Formatting code..."
npm run format

# Build the project
echo "🔨 Building project..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your Supabase credentials"
echo "2. Run 'npm run start:dev' to start the development server"
echo "3. Visit http://localhost:3000/api/v1 for API documentation"
echo ""
echo "🔧 Available commands:"
echo "  npm run start:dev    - Start development server"
echo "  npm run build        - Build the project"
echo "  npm run format       - Format code"
echo "  npm run lint         - Lint code"
echo "  npm run test         - Run tests"
