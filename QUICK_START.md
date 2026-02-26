# Quick Start Guide - Admin Functionality

## Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- MongoDB running on localhost:27017

## Step 1: Start MongoDB
Make sure MongoDB is running:
```bash
# Windows (if installed as service)
net start MongoDB

# Or check if it's running
mongosh --eval "db.version()"
```

## Step 2: Start Backend
```bash
cd backendlab
./mvnw spring-boot:run

# Or on Windows
mvnw.cmd spring-boot:run
```

Wait for the message: "Started LmsApplication in X seconds"

The backend will be available at: http://localhost:8080

## Step 3: Initialize Test Data
Open a new terminal and run:
```bash
# Using curl (Git Bash on Windows)
curl -X POST http://localhost:8080/api/init/test-data

# Or using PowerShell
Invoke-RestMethod -Uri "http://localhost:8080/api/init/test-data" -Method Post
```

This creates the default admin account:
- Username: `admin`
- Password: `admin123`
- Role: `SUPER_ADMIN`

## Step 4: Start Frontend
Open a new terminal:
```bash
cd frontend
npm install  # Only needed first time
npm run dev
```

The frontend will be available at: http://localhost:3000

## Step 5: Login and Test Admin Functions

1. Go to: http://localhost:3000/admin-login
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. Navigate to: http://localhost:3000/admin/admins
4. Test the admin functions:
   - View your profile
   - Change password
   - Create new admin
   - Manage admin users

## Troubleshooting

### "Failed to fetch" Error
This means the frontend cannot connect to the backend. Check:
1. Is the backend running? (Check terminal for "Started LmsApplication")
2. Is it running on port 8080? (Check application.properties)
3. Any firewall blocking localhost:8080?

### Backend Won't Start
1. Check if port 8080 is already in use
2. Verify MongoDB is running
3. Check Java version: `java -version` (should be 17+)

### MongoDB Connection Error
1. Ensure MongoDB is installed and running
2. Check connection string in `application.properties`
3. Default: `mongodb://localhost:27017/library_db`

### Frontend Won't Start
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Check Node version: `node -v` (should be 16+)

## Testing the API Directly

### Check if backend is running:
```bash
curl http://localhost:8080/api/init/check-users
```

### Test admin creation:
```bash
curl -X POST "http://localhost:8080/api/admins?createdBy=admin" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testadmin",
    "password": "test123",
    "fullName": "Test Admin",
    "email": "test@library.com",
    "role": "ADMIN",
    "permissions": ["MANAGE_BOOKS", "VIEW_REPORTS"]
  }'
```

## Common Issues

### Issue: "Error creating admin: Failed to fetch"
**Solution**: Backend is not running or not accessible
- Start the backend: `cd backendlab && ./mvnw spring-boot:run`
- Verify it's running: `curl http://localhost:8080/api/admins`

### Issue: "Username already exists"
**Solution**: The username is taken
- Try a different username
- Or delete the existing admin first

### Issue: "Email already exists"
**Solution**: The email is taken
- Try a different email
- Or update the existing admin's email first

### Issue: Cannot login
**Solution**: 
- Ensure test data is initialized: `POST /api/init/test-data`
- Check credentials: username=`admin`, password=`admin123`
- Verify admin is active in database

## Port Configuration

If you need to change ports:

### Backend (default: 8080)
Edit `backendlab/src/main/resources/application.properties`:
```properties
server.port=8080
```

### Frontend (default: 3000)
The port is set by Next.js. To change it:
```bash
npm run dev -- -p 3001
```

And update `frontend/config/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

## Next Steps

After successful setup:
1. Explore the admin dashboard
2. Create additional admin users with different roles
3. Test permission-based access
4. Update your profile and change password
5. Review the API documentation in ADMIN_FUNCTIONALITY_GUIDE.md
