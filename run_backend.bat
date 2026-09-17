@echo off
setlocal
title Civic Complaint System - Backend Server

:: Ensure system commands, Java, and Node are on PATH
if exist "C:\Program Files\Java\jdk-26" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-26"
) else if exist "C:\Program Files\Java\latest" (
    set "JAVA_HOME=C:\Program Files\Java\latest"
)

if defined JAVA_HOME (
    set "PATH=C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem;%JAVA_HOME%\bin;%PATH%"
) else (
    set "PATH=C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem;%PATH%"
)
set "MAVEN_OPTS=-Xmx256m -XX:MaxMetaspaceSize=128m"

cd /d "%~dp0backend"

echo ==========================================================
echo Starting Spring Boot Backend (Port 8080)...
echo ==========================================================
echo Java Home: %JAVA_HOME%
echo.

call mvnw.cmd spring-boot:run "-Dspring-boot.run.jvmArguments=-Xmx512m -Xms128m -XX:MaxMetaspaceSize=256m"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Backend failed to start.
)
pause
