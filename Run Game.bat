@echo off
cd .
start chrome --new-window "http://localhost:3000"
cmd /k npm start
pause