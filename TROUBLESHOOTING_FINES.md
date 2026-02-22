# Troubleshooting: "Error loading fines"

## Problem
The librarian's "Manage Fines" page shows "Error loading fines" message.

## Possible Causes

### 1. Backend Not Running
**Symptom**: Error message appears immediately when page loads

**Solution**:
```bash
# Check if backend is running
# Open browser and go to: http://localhost:8081/api/fines

# If you get "Cannot connect" or similar error, start the backend:
cd backendlab
./run.bat  # Windows
# or
./mvnw spring-boot:run  # Mac/Linux
```

### 2. MongoDB Not Running
**Symptom**: Backend starts but API returns 500 error

**Solution**:
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
# or
mongod
```

### 3. Wrong Port
**Symptom**: Backend is running but frontend can't connect

**Check**:
- Backend should be on port 8081
- Frontend should be on port 3000
- Check `application.properties`: `server.port=8081`

### 4. CORS Issues
**Symptom**: Browser console shows CORS error

**Solution**: Verify FineController has `@CrossOrigin(origins = "*")`

### 5. Empty Database
**Symptom**: Page loads but shows "No fines found"

**This is normal!** If there are no fines in the database yet, you need to:
1. Create some borrow records
2. Return books late to generate fines
3. Or create manual fines

## Testing the Backend

### Test 1: Check if backend is accessible
```bash
curl http://localhost:8081/api/fines
```

**Expected**: JSON array (empty `[]` or with fine objects)
**If fails**: Backend is not running or wrong port

### Test 2: Check specific endpoints
```bash
# Get all fines
curl http://localhost:8081/api/fines

# Get unpaid fines
curl http://localhost:8081/api/fines/unpaid

# Get paid fines
curl http://localhost:8081/api/fines/paid
```

### Test 3: Create a test fine
```bash
curl -X POST http://localhost:8081/api/fines/manual \
  -H "Content-Type: application/json" \
  -d '{
    "memberID": "test123",
    "amount": 10.0,
    "reason": "Test fine"
  }'
```

## Frontend Error Handling

The frontend now provides better error messages:

### Error Messages
- **"Error loading fines. Please check if the backend is running on port 8081."**
  - Backend is not accessible
  - Check if backend is running
  - Check if port 8081 is correct

- **"No fines found"**
  - This is normal if database is empty
  - Not an error, just no data yet

### Success Indicators
- Green message: "Fine marked as paid successfully!"
- Green message: "Fine waived successfully!"
- Red message: Any error

## Common Solutions

### Solution 1: Restart Backend
```bash
# Stop the backend (Ctrl+C)
# Then restart:
cd backendlab
./run.bat
```

### Solution 2: Check MongoDB Connection
```bash
# Check if MongoDB is running
# Windows: Task Manager -> Services -> MongoDB
# Mac/Linux: ps aux | grep mongod

# Check MongoDB connection in application.properties:
spring.data.mongodb.uri=mongodb://localhost:27017/library_management
```

### Solution 3: Clear Browser Cache
- Press F12 to open DevTools
- Go to Network tab
- Check "Disable cache"
- Refresh page (F5)

### Solution 4: Check Browser Console
- Press F12
- Go to Console tab
- Look for error messages
- Common errors:
  - `Failed to fetch` - Backend not running
  - `CORS error` - CORS not configured
  - `404 Not Found` - Wrong endpoint URL
  - `500 Internal Server Error` - Backend error

## Verification Steps

1. **Backend Running?**
   ```
   Open: http://localhost:8081/api/fines
   Should see: [] or [{...}]
   ```

2. **MongoDB Running?**
   ```
   Check Task Manager (Windows) or ps aux (Linux/Mac)
   Should see: mongod process
   ```

3. **Frontend Running?**
   ```
   Open: http://localhost:3000
   Should see: Login page or dashboard
   ```

4. **Can Login?**
   ```
   Username: librarian
   Password: lib123
   Should redirect to: /librarian/dashboard
   ```

5. **Can Access Fines Page?**
   ```
   Navigate to: Manage Fines
   Should see: Filter buttons and fines list (or "No fines found")
   ```

## Creating Test Data

If you want to test with actual fines:

### Method 1: Through UI
1. Login as Librarian
2. Issue a book to a member
3. Wait for due date to pass (or manually set past due date in database)
4. Return the book
5. Fine will be automatically generated

### Method 2: Manual Fine Creation
1. Login as Admin or Librarian
2. Use the manual fine creation endpoint:
```bash
curl -X POST http://localhost:8081/api/fines/manual \
  -H "Content-Type: application/json" \
  -d '{
    "memberID": "member123",
    "amount": 15.50,
    "reason": "Lost book"
  }'
```

### Method 3: Direct Database Insert
```javascript
// Using MongoDB Compass or mongo shell
db.fines.insertOne({
  memberID: "member123",
  borrowRecordID: "borrow123",
  amount: 10.0,
  amountPaid: 0.0,
  reason: "Overdue return: 10 days late",
  issueDate: new Date(),
  status: "UNPAID"
})
```

## Still Having Issues?

### Check Backend Logs
Look at the terminal where backend is running for error messages:
- `Connection refused` - MongoDB not running
- `Port already in use` - Another process using port 8081
- `NullPointerException` - Data issue in database

### Check Frontend Console
Press F12 and look for:
- Network errors
- JavaScript errors
- Failed API calls

### Verify Configuration
1. `backendlab/src/main/resources/application.properties`
   ```properties
   server.port=8081
   spring.data.mongodb.uri=mongodb://localhost:27017/library_management
   ```

2. `fronendlab/pages/librarian/fines.js`
   ```javascript
   const url = 'http://localhost:8081/api/fines';
   ```

## Contact Support
If none of these solutions work:
1. Check the backend console for error messages
2. Check the browser console (F12) for errors
3. Verify all services are running
4. Try restarting everything (MongoDB, Backend, Frontend)
