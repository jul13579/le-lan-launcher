@echo off

echo.
echo Installing npm dependencies....
call npm i

echo.
echo Building LEGC LAN-Launcher...
call npm run electron:build