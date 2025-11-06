@echo off
setlocal enabledelayedexpansion

REM Usage: create-domain.bat library.local [port]
set HOSTNAME=%1
if "%HOSTNAME%"=="" set HOSTNAME=library.local
set PORT=%2
if "%PORT%"=="" set PORT=5000

echo This will add %HOSTNAME% to your hosts file (requires Administrator).
echo.
REM Check admin rights by attempting a privileged command
net session >nul 2>&1
if %errorLevel% NEQ 0 (
  echo Please re-run this script as Administrator.
  pause
  exit /b 1
)

set HOSTS=%SystemRoot%\System32\drivers\etc\hosts

findstr /R /C:"^[ ]*127\.0\.0\.1[ ]\+%HOSTNAME%$" "%HOSTS%" >nul 2>nul
if %errorlevel%==0 (
  echo %HOSTNAME% already present in hosts.
) else (
  echo 127.0.0.1 %HOSTNAME%>>"%HOSTS%"
  echo Added 127.0.0.1 %HOSTNAME% to hosts.
)

echo To use this domain automatically when starting, set LIBRARY_HOST=%HOSTNAME% before running start.bat
echo Example: setx LIBRARY_HOST %HOSTNAME%
echo Then open http://%HOSTNAME%:%PORT%
exit /b 0


