# Start Backend Server Script
Write-Host "Starting Library Management System Backend..." -ForegroundColor Green
Write-Host ""

# Check if Maven is installed
$mvnCommand = Get-Command mvn -ErrorAction SilentlyContinue

if ($mvnCommand) {
    Write-Host "Using system Maven..." -ForegroundColor Cyan
    mvn spring-boot:run
} else {
    Write-Host "Maven not found. Checking for Maven wrapper..." -ForegroundColor Yellow
    
    # Check if wrapper jar exists
    $wrapperJar = ".mvn\wrapper\maven-wrapper.jar"
    
    if (Test-Path $wrapperJar) {
        Write-Host "Using Maven wrapper..." -ForegroundColor Cyan
        java -jar $wrapperJar -Dmaven.multiModuleProjectDirectory=$PWD spring-boot:run
    } else {
        Write-Host "Maven wrapper jar not found. Downloading..." -ForegroundColor Yellow
        
        # Download Maven wrapper jar
        $wrapperUrl = "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.4/maven-wrapper-3.3.4.jar"
        $wrapperDir = ".mvn\wrapper"
        
        if (-not (Test-Path $wrapperDir)) {
            New-Item -ItemType Directory -Path $wrapperDir -Force | Out-Null
        }
        
        try {
            Write-Host "Downloading from $wrapperUrl..." -ForegroundColor Cyan
            Invoke-WebRequest -Uri $wrapperUrl -OutFile $wrapperJar
            Write-Host "Download complete!" -ForegroundColor Green
            Write-Host "Starting application..." -ForegroundColor Cyan
            java -jar $wrapperJar -Dmaven.multiModuleProjectDirectory=$PWD spring-boot:run
        } catch {
            Write-Host "ERROR: Failed to download Maven wrapper!" -ForegroundColor Red
            Write-Host "Please install Maven manually or check your internet connection." -ForegroundColor Red
            Write-Host ""
            Write-Host "You can install Maven from: https://maven.apache.org/download.cgi" -ForegroundColor Yellow
            exit 1
        }
    }
}
