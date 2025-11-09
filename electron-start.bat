@echo off
set NODE_ENV=development
start cmd /k "npm run dev"
timeout /t 5 /nobreak
electron .
