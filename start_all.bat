@echo off
title Launch Civic AI Complaint System
echo ==========================================================
echo Starting Civic AI Complaint Management System...
echo ==========================================================
start "CivicAI Backend (Spring Boot :8080)" "%~dp0run_backend.bat"
timeout /t 3 /nobreak >nul
start "CivicAI Frontend (Vite React :5173)" "%~dp0run_frontend.bat"
echo.
echo Both servers are starting up!
echo - Backend API:  http://localhost:8080
echo - Frontend Web: http://localhost:5173
echo.
pause
