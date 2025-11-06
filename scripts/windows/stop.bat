@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0..\.."

if not exist server.pid (
  echo No server.pid found. Server may not be running.
  exit /b 0
)

set /p PID=<server.pid

if "%PID%"=="" (
  echo PID file empty. Deleting pid file.
  del /f /q server.pid >nul 2>nul
  exit /b 0
)

echo Stopping server PID %PID% ...
taskkill /PID %PID% /F >nul 2>nul
if errorlevel 1 (
  echo Could not terminate PID %PID%. It may have already exited.
)

del /f /q server.pid >nul 2>nul
echo Stopped.
exit /b 0


