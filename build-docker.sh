#!/bin/bash

# Build script for OrderFlow Docker image
set -e

echo "🚀 Building OrderFlow Docker Image..."

# Check if we're in the right directory
if [ ! -f "Dockerfile.prod" ]; then
    echo "❌ Error: Dockerfile.prod not found. Please run this script from the project root."
    exit 1
fi

# Build frontend first
echo "📦 Building frontend..."
cd frontend
npm ci
npm run build
cd ..

# Check if frontend build was successful
if [ ! -d "frontend/dist" ]; then
    echo "❌ Error: Frontend build failed. frontend/dist directory not found."
    exit 1
fi

echo "✅ Frontend built successfully"

# Build Docker image
echo "🐳 Building Docker image..."
docker build -f Dockerfile.prod -t orderflow:latest .

echo "✅ Docker image built successfully!"
echo "📋 Image details:"
docker images orderflow:latest

echo ""
echo "🚀 To run the container:"
echo "   docker run -p 8080:8080 orderflow:latest"
echo ""
echo "🔍 To test the health endpoint:"
echo "   curl http://localhost:8080/health" 