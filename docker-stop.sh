#!/bin/bash

echo "🛑 Stopping SlopeSafe Docker Environment..."
echo ""

# Stop all containers
docker compose down

echo ""
echo "✅ All services have been stopped."
echo ""
echo "💡 To remove volumes as well, run: docker compose down -v"
echo ""
