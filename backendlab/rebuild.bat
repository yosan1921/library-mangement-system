@echo off
echo Cleaning and rebuilding the project...
echo.

REM Check if Maven is installed
where mvn >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using system Maven...
    mvn clean compile
) else (
    echo Maven not found in PATH. Trying Maven wrapper...
    if exist mvnw.cmd (
        call mvnw.cmd clean compile
    ) else (
        echo ERROR: Neither Maven nor Maven wrapper found!
        pause
        exit /b 1
    )
)

echo.
echo Build complete! Now restart your Spring Boot application.
pause
