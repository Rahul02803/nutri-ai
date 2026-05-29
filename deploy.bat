@echo off
color 0A
title NutriAI GitHub Deployment Assistant

echo ===================================================
echo             NutriAI GitHub Deployer
echo ===================================================
echo.
echo This helper script will securely push your premium 
echo minimalist NutriAI code to your new GitHub repository.
echo.
echo Git on Windows will open a secure 1-click web popup 
echo asking you to sign in. No passwords needed!
echo.
echo ===================================================
echo.

:: Step 1: Request GitHub username
set /p USERNAME="Enter your GitHub Username: "
if "%USERNAME%"=="" (
    echo.
    echo [ERROR] Username cannot be blank! Please run the script again.
    pause
    exit /b
)

echo.
echo [1/3] Setting remote repository origin...
:: Remove old origin if exists to prevent crashes
git remote remove origin >nul 2>&1
git remote add origin https://github.com/%USERNAME%/nutri-ai.git

echo.
echo [2/3] Setting branch to main...
git branch -M main

echo.
echo [3/3] Pushing code to GitHub...
echo A secure browser authentication window will now pop up. 
echo Please click "Sign in with your browser" in that popup to authorize the push!
echo.
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Git push failed. 
    echo Please make sure you created a repository named 'nutri-ai' on github.com first!
    pause
    exit /b
)

echo.
echo ===================================================
echo [SUCCESS] Your code has been uploaded to GitHub!
echo.
echo Now go to vercel.com, log in, import 'nutri-ai', and click Deploy!
echo ===================================================
echo.
pause
