#!/bin/bash

echo "🚀 Setting up SubGuard AI Development Environment"

# Create virtual environment
echo "📦 Creating Python virtual environment..."
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Setup environment files
echo "🔧 Setting up environment files..."
cd ..

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "⚠️  Please update backend/.env with your Gemini API key"
fi

if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.example frontend/.env.local
fi

# Start services with Docker
echo "🐳 Starting services with Docker..."
docker-compose up -d

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your Gemini API key"
echo "2. Access the application at http://localhost:3000"
echo "3. API docs at http://localhost:8000/docs"
echo ""
echo "To stop services: docker-compose down"