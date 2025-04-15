@echo off
echo Starting TraderScan Application...
start cmd /k "cd server && npm run start"
timeout /t 3
start cmd /k "cd client && npm run dev"
echo Both server and client are starting in separate windows.
echo Server on port 5000, Client on port 3000 