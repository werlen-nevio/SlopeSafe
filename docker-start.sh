#!/bin/bash

echo "🚀 Starting SlopeSafe Docker Environment..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start containers
echo "📦 Building and starting containers..."
docker compose up -d --build

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service status
echo ""
echo "✅ Service Status:"
docker compose ps

echo ""
echo "🎉 SlopeSafe is running!"
echo ""
echo "📍 Service URLs:"
echo "   - Backend API: http://localhost:8000"
echo "   - Web Frontend: http://localhost:3000"
echo "   - MySQL: localhost:3306"
echo ""
echo "📝 Useful commands:"
echo "   - View logs: docker compose logs -f"
echo "   - Stop services: docker compose down"
echo "   - Restart services: docker compose restart"
echo ""
