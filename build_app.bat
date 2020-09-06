@echo off

echo.
echo Installing npm dependencies....
call npm install

echo.
echo Building LEGC LAN-Launcher...
call npm run electron:build