```bat
@echo off
REM ===============================
REM   BondX Dev Start-up Script
REM   Loads SSH Key Automatically
REM ===============================

REM Change to project directory
cd /d E:\BondX-public\bondx-mock-v5

REM Start ssh-agent if not running
sc query ssh-agent | find "RUNNING" >nul
if errorlevel 1 (
    echo Starting ssh-agent service...
    powershell -Command "Start-Service ssh-agent"
)

REM Add SSH key (only if not already loaded)
for /f "tokens=*" %%i in ('ssh-add -l 2^>nul') do set KEY=%%i
if not defined KEY (
    echo Adding SSH key...
    ssh-add "%USERPROFILE%\.ssh\id_ed25519"
)

REM Start local Python server in a new window
start "BONDx Local Server" powershell -NoExit -Command "cd E:\BondX-public\bondx-mock-v5; python -m http.server 8000"

REM Start auto-push watcher in a new window
start "BONDx Auto Push" powershell -ExecutionPolicy Bypass -NoExit -File "E:\BondX-public\bondx-mock-v5\auto-push-poll.ps1"

REM Open site in browser
start http://localhost:8000

exit