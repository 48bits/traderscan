@echo off
echo Clearing TraderScan lock files...
del /f /q %TEMP%\traderscan-hyperliquid-processing.lock
echo Lock files cleared. You can now restart the server.
pause 