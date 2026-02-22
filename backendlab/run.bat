@echo off
echo Starting Spring Boot application...
echo.

REM Check if Maven is installed
where mvn >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using system Maven...
    mvn spring-boot:run
) else (
    echo Maven not found in PATH. Trying Maven wrapper...
    if exist mvnw.cmd (
        call mvnw.cmd spring-boot:run
    ) else (
        echo ERROR: Neither Maven nor Maven wrapper found!
        echo Please install Maven or fix the Maven wrapper.
        pause
        exit /b 1
    )
)
