@echo off
setlocal
title Civic Complaint System - Backend Server

:: Ensure system commands, Java, and Node are on PATH
set "PATH=C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem;C:\Program Files\Java\jdk-26\bin;%PATH%"
set "JAVA_HOME=C:\Program Files\Java\jdk-26"
set "MAVEN_OPTS=-Xmx768m"

cd /d "%~dp0backend"

echo ==========================================================
echo Starting Spring Boot Backend (Port 8080)...
echo ==========================================================
echo Java Home: %JAVA_HOME%
echo.

call mvnw.cmd spring-boot:run
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Backend failed to start.
)
pause
