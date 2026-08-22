@echo off
echo Stopping Saanjh Studio...

:: Kill by saved PID first
if exist .pid (
  set /p SAVED_PID=<.pid
  taskkill /PID %SAVED_PID% /F >nul 2>&1
  del .pid >nul 2>&1
)

:: Also kill anything still on port 4173
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":4173 "') do (
  taskkill /PID %%p /F >nul 2>&1
)

echo  ✔  Server stopped.
