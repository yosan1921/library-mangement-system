# Login Setup Guide - UPDATED

## Issue Fixed
The frontend was trying to connect to port 8080, but your backend runs on port **8081**. This has been corrected.

## Current Status
✅ Frontend updated to use port 8081
✅ AuthController created
✅ AuthService created  
✅ Login page updated
⚠️ Backend needs to be started manually

## Setup Instructions

### 1. Start the Backend MANUALLY

**Option A: If you have Maven installed**
```bash
cd backendlab
mvn spring-boot:run
```

**Option B: Using Maven wrapper (if PowerShell is available)**
```bash
cd backendlab
./mvnw spring-boot:run
```

**Option C: Using your IDE**
- Open the project in IntelliJ IDEA or Eclipse
- Run the `LmsApplication.java` main class

### 2. Verify Backend is Running
Open your browser and go to: `http://localhost:8081/api/test`

You should see a response from the server.

### 3. Initialize Test Data
Once the backend is running, visit:
```
http://localhost:8081/api/init/test-data
```

Or use curl:
```bash
curl -X POST http://localhost:8081/api/init/test-data
```

### 4. Start the Frontend
Open a NEW terminal:
```bash
cd fronendlab
npm run dev
```

### 5. Test Login
Navigate to `http://localhost:3000/login`

## Test Credentials

| Username   | Password  | Role       |
|------------|-----------|------------|
| admin      | admin123  | Admin      |
| librarian  | lib123    | Librarian  |
| M001       | (any)     | Member     |

## Troubleshooting

### "Failed to fetch" error
- Make sure the backend is running on port 8081
- Check if MongoDB connection is working
- Verify CORS is enabled in the backend

### Backend won't start
- Check if port 8081 is already in use
- Verify MongoDB connection string in `application.properties`
- Make sure Java is installed (Java 11 or higher)

### Can't initialize test data
- Make sure backend is fully started (wait for "Started LmsApplication" message)
- Check MongoDB connection
- Try accessing the endpoint again

## What Was Changed

1. **authService.js** - Updated API URL from port 8080 to 8081
2. **login.js** - Now uses authService for cleaner code
3. **AuthController.java** - New endpoint at `/api/auth/login`
4. **AuthService.java** - Handles authentication logic
5. **InitDataController.java** - Creates test users at `/api/init/test-data`
