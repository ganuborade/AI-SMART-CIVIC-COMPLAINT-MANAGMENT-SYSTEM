@echo off
title Civic Complaint System - Frontend Web App
cd /d "%~dp0frontend"
echo ==========================================================
echo Starting React Vite Frontend Server (Port 5173)...
echo ==========================================================
call npm run dev
pause
