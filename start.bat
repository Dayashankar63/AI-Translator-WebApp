@echo off
echo.
echo ========================================
echo   🎯 AI Interview App - Startup
echo ========================================
echo.

REM Check if MongoDB is running
echo Checking MongoDB...
timeout /t 2 >nul

REM Start server in background
echo.
echo Starting Server on port 5000...
cd server
start "AI Interview Server" cmd /k npm start

REM Wait a bit for server to start
timeout /t 3 >nul

REM Start client
echo.
echo Starting Client on port 3000...
cd ..\client
start "AI Interview Client" cmd /k npm start

echo.
echo ========================================
echo ✅ Application started!
echo.
echo 📱 Client: http://localhost:3000
echo 🖥️  Server: http://localhost:5000
echo 🗄️  Database: mongodb://localhost:27017
echo.
echo 💡 First user: test@example.com / password123
echo.
echo ========================================
echo.
