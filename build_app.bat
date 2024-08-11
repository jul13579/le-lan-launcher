@echo off

echo.
echo Installing npm dependencies....
call npm ci

echo.
echo Building LEGC LAN-Launcher...
call npm run package