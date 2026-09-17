@echo off
setlocal
title Launch Civic AI Complaint System

cd /d "%~dp0"

:: Ensure essential Windows system directories and runtimes are on PATH
if exist "C:\Program Files\Java\jdk-26" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-26"
) else if exist "C:\Program Files\Java\latest" (
    set "JAVA_HOME=C:\Program Files\Java\latest"
)

if defined JAVA_HOME (
    set "PATH=C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem;%JAVA_HOME%\bin;C:\Program Files\nodejs;%PATH%"
) else (
    set "PATH=C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem;C:\Program Files\nodejs;%PATH%"
)

echo ==========================================================
echo Starting Civic AI Complaint Management System...
echo ==========================================================
echo.

echo Starting Spring Boot Backend...
start "CivicAI Backend (Spring Boot :8080)" "%ComSpec%" /k call "%~dp0run_backend.bat"

:: Universal Windows sleep using ping (wait 3 seconds)
ping 127.0.0.1 -n 4 >nul

echo Starting React Vite Frontend...
start "CivicAI Frontend (Vite React :5173)" "%ComSpec%" /k call "%~dp0run_frontend.bat"

:: Wait another 3 seconds for servers to initialize
ping 127.0.0.1 -n 4 >nul

echo.
echo ==========================================================
echo Both servers are starting up in separate windows!
echo - Backend API:  http://localhost:8080
echo - Frontend Web: http://localhost:5173
echo ==========================================================
echo.
echo Opening Frontend in your default browser...
start http://localhost:5173
echo.
pause
