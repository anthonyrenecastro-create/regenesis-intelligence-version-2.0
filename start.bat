@echo off
title Regenesis Intelligence v2.0
color 0b

echo.
echo  ============================================
echo   REGENESIS INTELLIGENCE v2.0
echo   Local-first AI workstation (Ollama)
echo  ============================================
echo.

:: Step 1: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js not found.
    echo  Download and install from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo  [1/4] Node.js found.

:: Step 2: Check Ollama
where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo  [2/4] Ollama not found. Opening download page...
    start https://ollama.ai/download
    echo  Please install Ollama, then run this script again.
    echo.
    pause
    exit /b 1
)
echo  [2/4] Ollama found.

:: Step 3: Ensure Ollama is running
curl -s http://localhost:11434/api/tags >nul 2>nul
if %errorlevel% neq 0 (
    echo  [3/4] Starting Ollama...
    start /min ollama serve
    timeout /t 5 /nobreak >nul
) else (
    echo  [3/4] Ollama already running.
)

:: Step 4: Ensure llama3 model is pulled
ollama list 2>nul | findstr /i "llama3" >nul
if %errorlevel% neq 0 (
    echo  [4/4] Pulling llama3 model (one-time, ~4.7GB)...
    ollama pull llama3
) else (
    echo  [4/4] llama3 model ready.
)

:: Step 5: Install dependencies (first run only)
if not exist "node_modules" (
    echo.
    echo  Installing dependencies (first run only)...
    call npm install
    if %errorlevel% neq 0 (
        echo  [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

:: Step 6: Launch
echo.
echo  ============================================
echo   Starting Regenesis Intelligence...
echo   Open http://localhost:3000 in your browser
echo  ============================================
echo.
call npm run dev
pause
