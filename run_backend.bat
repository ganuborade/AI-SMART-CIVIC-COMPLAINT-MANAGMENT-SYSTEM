@echo off
title Civic Complaint System - Backend Server
cd /d "%~dp0backend"
if not defined JAVA_HOME (
    set "JAVA_HOME=C:\Program Files\Java\jdk-26"
    set "PATH=C:\Program Files\Java\jdk-26\bin;%PATH%"
)
echo ==========================================================
echo Starting Spring Boot Backend (Port 8080)...
echo ==========================================================
call mvnw.cmd spring-boot:run
pause
