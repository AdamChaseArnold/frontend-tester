@echo off
echo Checking port 4000...
netstat -aon | findstr "4000"
echo.
echo Checking port 4001...
netstat -aon | findstr "4001"
echo.
echo Check complete.
pause