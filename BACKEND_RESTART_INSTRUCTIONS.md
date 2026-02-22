# Backend Restart Instructions

## The Issue
The new controllers (AuthController and InitDataController) were created but the backend needs to be restarted to load them.

## Quick Fix - Restart the Backend

### Step 1: Stop the Current Backend
If the backend is running, stop it (Ctrl+C in the terminal where it's running)

### Step 2: Restart the Backend
Run ONE of these commands in the `backendlab` folder:

**Option A: If you have Maven**
```bash
mvn spring-boot:run
```

**Option B: Using Maven wrapper**
```bash
./mvnw spring-boot:run
```

**Option C: From your IDE**
- Right-click on `LmsApplication.java`
- Select "Run" or "Debug"

### Step 3: Wait for Startup
Wait until you see:
```
Started LmsApplication in X.XXX seconds
```

### Step 4: Test the New Endpoints

**Initialize test data:**
```
http://localhost:8081/api/init/test-data
```

**Test login endpoint:**
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

## Alternative: Clean Build (if restart doesn't work)

If simply restarting doesn't work, do a clean build:

```bash
cd backendlab
mvn clean install
mvn spring-boot:run
```

## Verify It's Working

Once restarted, you should be able to:
1. Visit `http://localhost:8081/api/init/test-data` - Creates test users
2. Visit `http://localhost:3000/login` - Login page
3. Login with username: `admin`, password: `admin123`

## Note
The backend must be restarted whenever you add new controllers or make changes to Java files.
