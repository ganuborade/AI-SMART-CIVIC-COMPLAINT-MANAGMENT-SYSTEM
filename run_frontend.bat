@echo off
setlocal
title Civic Complaint System - Frontend Web App

:: Ensure system commands and Node are on PATH
set "PATH=C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem;C:\Program Files\nodejs;%PATH%"

cd /d "%~dp0frontend"

echo ==========================================================
echo Starting React Vite Frontend Server (Port 5173)...
echo ==========================================================
echo.

call npm run dev
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Frontend failed to start.
)
pause
