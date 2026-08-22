@echo off
echo Starting Saanjh Studio...

:: ── Try Node.js ─────────────────────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% == 0 goto :run_node

:: NVM for Windows
if exist "%APPDATA%\nvm\nvm.exe" (
  for /f "delims=" %%i in ('"%APPDATA%\nvm\nvm.exe" current 2^>nul') do set NVM_VER=%%i
  if defined NVM_VER set PATH=%APPDATA%\nvm\%NVM_VER%;%PATH%
)
where node >nul 2>&1
if %errorlevel% == 0 goto :run_node

:: ── Fallback: Python ─────────────────────────────────────────────────────────
where python >nul 2>&1
if %errorlevel% == 0 goto :run_python
where python3 >nul 2>&1
if %errorlevel% == 0 (set PYTHON=python3 & goto :run_python)

echo.
echo [ERROR] Neither node.exe nor python found.
echo         Install Node.js from  https://nodejs.org  (recommended)
echo         or Python from        https://python.org
echo.
pause
exit /b 1

:: ── Start with Node ──────────────────────────────────────────────────────────
:run_node
call :kill_port
start "Saanjh Studio" /min node server.js
goto :wait

:: ── Start with Python ────────────────────────────────────────────────────────
:run_python
call :kill_port
echo  (using proxy_server.py — serves files + Instagram feed proxy)
start "Saanjh Studio" /min python proxy_server.py
goto :wait

:wait
timeout /t 2 /nobreak >nul
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":4173 "') do (
  echo %%p > .pid
  goto :opened
)
:opened
echo.
echo  ✔  Saanjh Studio  →  http://localhost:4173
echo     Run stop.bat to shut it down.
echo.
start http://localhost:4173
exit /b 0

:: ── Helper: kill anything already on 4173 ────────────────────────────────────
:kill_port
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":4173 "') do (
  taskkill /PID %%p /F >nul 2>&1
)
exit /b 0
