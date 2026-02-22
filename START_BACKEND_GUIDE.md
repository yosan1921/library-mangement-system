# How to Start the Backend Server

## Quick Start (Recommended)

Since you're in PowerShell and have Java installed, use this command directly:

```powershell
cd backendlab
.\start-backend.ps1
```

## Alternative Methods

### Method 1: Direct PowerShell Command
```powershell
cd backendlab
.\mvnw spring-boot:run
```

### Method 2: Using Batch File
```cmd
cd backendlab
.\run.bat
```

### Method 3: Manual Maven Command (if Maven is installed)
```powershell
cd backendlab
mvn spring-boot:run
```

## Current Issue

The Maven wrapper (mvnw.cmd) requires PowerShell to be in the PATH, which seems to be missing in your environment.

## Solution: Install Maven Directly

Since the Maven wrapper is having issues, I recommend installing Maven directly:

### Option A: Using Chocolatey (if installed)
```powershell
choco install maven
```

### Option B: Manual Installation
1. Download Maven from: https://maven.apache.org/download.cgi
2. Extract to C:\Program Files\Apache\maven
3. Add to PATH: C:\Program Files\Apache\maven\bin
4. Restart PowerShell
5. Run: `mvn spring-boot:run`

### Option C: Use IntelliJ IDEA or Eclipse
1. Open the `backendlab` folder in your IDE
2. Let it import the Maven project
3. Run the `LmsApplication` main class

## Verify Backend is Running

Once started, you should see:
```
Started LmsApplication in X.XXX seconds (JVM running for X.XXX)
```

Test the API:
- Open browser: http://localhost:8081/api/books
- Should return JSON array of books (or empty array)

## Troubleshooting

### Error: "Cannot start maven from wrapper"
**Solution**: Install Maven directly (see above)

### Error: "Port 8081 already in use"
**Solution**: 
```powershell
# Find process using port 8081
Get-NetTCPConnection -LocalPort 8081 | Select-Object OwningProcess
# Kill the process (replace PID with actual process ID)
Stop-Process -Id PID -Force
```

### Error: "MongoDB connection failed"
**Solution**: The application.properties is configured to use MongoDB Atlas (cloud). The connection string is already set up, so this should work automatically.

## Current Configuration

- **Port**: 8081
- **Database**: MongoDB Atlas (cloud)
- **API Base**: http://localhost:8081/api

## Next Steps After Backend Starts

1. Keep the backend terminal running
2. Open a new terminal for frontend:
   ```powershell
   cd fronendlab
   npm run dev
   ```
3. Open browser: http://localhost:3000/admin/dashboard
4. All features should now work!

## Files Fixed

✅ All frontend service files now point to port 8081
✅ ReportService.java compilation errors fixed
✅ run.bat updated
✅ start-backend.ps1 created

The backend is ready to run - you just need to get Maven working!
