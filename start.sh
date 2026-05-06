#!/bin/bash

echo ""
echo "========================================"
echo "  🎯 AI Interview App - Startup"
echo "========================================"
echo ""

# Check if MongoDB is running
echo "Checking MongoDB..."
sleep 2

# Start server in background
echo ""
echo "Starting Server on port 5000..."
cd server
npm start &
SERVER_PID=$!

# Wait a bit for server to start
sleep 3

# Start client
echo ""
echo "Starting Client on port 3000..."
cd ../client
npm start &
CLIENT_PID=$!

echo ""
echo "========================================"
echo "✅ Application started!"
echo ""
echo "📱 Client: http://localhost:3000"
echo "🖥️  Server: http://localhost:5000"
echo "🗄️  Database: mongodb://localhost:27017"
echo ""
echo "💡 First user: test@example.com / password123"
echo ""
echo "========================================"
echo ""

# Wait for both processes
wait $SERVER_PID $CLIENT_PID
