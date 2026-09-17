@echo off
setlocal
title Launch Civic AI Complaint System

:: Ensure essential Windows system directories and runtimes are on PATH
set "PATH=C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem;C:\Program Files\Java\jdk-26\bin;C:\Program Files\nodejs;%PATH%"

echo ==========================================================
echo Starting Civic AI Complaint Management System...
echo ==========================================================

echo Starting Spring Boot Backend...
start "CivicAI Backend (Spring Boot :8080)" "%SystemRoot%\System32\cmd.exe" /k "call \"%~dp0run_backend.bat\""

:: Universal Windows sleep using ping (avoids Git Bash timeout conflicts)
ping 127.0.0.1 -n 4 >nul

echo Starting React Vite Frontend...
start "CivicAI Frontend (Vite React :5173)" "%SystemRoot%\System32\cmd.exe" /k "call \"%~dp0run_frontend.bat\""

echo.
echo ==========================================================
echo Both servers are starting up in separate windows!
echo - Backend API:  http://localhost:8080
echo - Frontend Web: http://localhost:5173
echo ==========================================================
echo.
pause
