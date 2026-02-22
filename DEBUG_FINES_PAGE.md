# Debug Fines Page - Step by Step

## If you see "Error loading fines" message:

### Step 1: Open Browser Console
1. Press `F12` on your keyboard
2. Click on the "Console" tab
3. Look for messages starting with "Fetching fines from:"

### Step 2: Check Console Messages

You should see these messages in order:

```
Fetching fines from: http://localhost:8081/api/fines
Response status: 200
Received data: [Array of fines]
Fines loaded successfully: 2 fines
```

### Step 3: Identify the Problem

#### Scenario A: No messages appear
**Problem**: JavaScript error before fetch
**Solution**: Check for syntax errors in browser console

#### Scenario B: "Fetching fines from..." appears but nothing else
**Problem**: Network request failed
**Possible causes**:
- Backend not running
- Wrong port
- CORS issue

**Solution**:
```bash
# Test backend directly
curl http://localhost:8081/api/fines

# Or open in browser:
http://localhost:8081/api/fines
```

#### Scenario C: "Response status: 500" or other error code
**Problem**: Backend error
**Solution**: Check backend console for error messages

#### Scenario D: "Data is not an array" message
**Problem**: Backend returning wrong format
**Solution**: Check what backend is actually returning

#### Scenario E: All messages appear but still shows error
**Problem**: Error in rendering the data
**Solution**: Check for JavaScript errors after the fetch

### Step 4: Common Fixes

#### Fix 1: Backend Not Running
```bash
cd backendlab
./run.bat  # Windows
# or
./mvnw spring-boot:run  # Mac/Linux
```

#### Fix 2: MongoDB Not Running
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

#### Fix 3: Clear Browser Cache
1. Press `Ctrl+Shift+Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh page (`F5`)

#### Fix 4: Hard Refresh
- Windows/Linux: `Ctrl+F5`
- Mac: `Cmd+Shift+R`

### Step 5: Verify Backend Response

Open this URL in your browser:
```
http://localhost:8081/api/fines
```

You should see JSON like:
```json
[
  {
    "id": "6996dd00f080fa0ea5ea9a46",
    "memberID": "6996db05f080fa0ea5ea9a43",
    "borrowRecordID": null,
    "amount": 12.0,
    "amountPaid": 0.0,
    "reason": "uouoot",
    "issueDate": "2026-02-19",
    "paidDate": null,
    "status": "UNPAID",
    "amountDue": 12.0
  }
]
```

If you see this, backend is working correctly!

### Step 6: Check Network Tab

1. Press `F12`
2. Go to "Network" tab
3. Refresh the page
4. Look for request to `/api/fines`
5. Click on it
6. Check:
   - Status code (should be 200)
   - Response (should be JSON array)
   - Headers (check CORS headers)

### Step 7: Test Different Filters

Try clicking the filter buttons:
- "All Fines" - Should call `/api/fines`
- "Unpaid" - Should call `/api/fines/unpaid`
- "Paid" - Should call `/api/fines/paid`

Check console for each click to see which endpoint is being called.

## Expected Console Output (Success)

```
Fetching fines from: http://localhost:8081/api/fines
Response status: 200
Received data: (2) [{…}, {…}]
  0: {id: '6996dd00f080fa0ea5ea9a46', memberID: '6996db05f080fa0ea5ea9a43', ...}
  1: {id: '6996dd68f080fa0ea5ea9a47', memberID: '6996db05f080fa0ea5ea9a43', ...}
Fines loaded successfully: 2 fines
```

## Expected Console Output (Error)

```
Fetching fines from: http://localhost:8081/api/fines
Error loading fines: TypeError: Failed to fetch
Error details: Failed to fetch
```

This means backend is not accessible.

## Quick Test Commands

### Test 1: Backend Health
```bash
curl http://localhost:8081/api/fines
```

### Test 2: Specific Endpoints
```bash
# All fines
curl http://localhost:8081/api/fines

# Unpaid fines
curl http://localhost:8081/api/fines/unpaid

# Paid fines
curl http://localhost:8081/api/fines/paid
```

### Test 3: Create Test Fine
```bash
curl -X POST http://localhost:8081/api/fines/manual \
  -H "Content-Type: application/json" \
  -d '{"memberID":"test123","amount":5.0,"reason":"Test"}'
```

## Still Not Working?

### Last Resort Steps:

1. **Restart Everything**
   ```bash
   # Stop backend (Ctrl+C)
   # Stop frontend (Ctrl+C)
   # Stop MongoDB
   
   # Start MongoDB
   # Start backend
   # Start frontend
   ```

2. **Check Ports**
   ```bash
   # Windows
   netstat -ano | findstr :8081
   netstat -ano | findstr :3000
   
   # Mac/Linux
   lsof -i :8081
   lsof -i :3000
   ```

3. **Rebuild Frontend**
   ```bash
   cd fronendlab
   rm -rf .next
   npm run dev
   ```

4. **Check for Typos**
   - Backend port: 8081 (not 8080)
   - Frontend port: 3000
   - URL: http://localhost:8081/api/fines (not /fine or /fines/)

## Success Indicators

When everything is working, you should see:
- ✅ No error message on page
- ✅ Filter buttons visible
- ✅ Fines list displayed (or "No fines found" if empty)
- ✅ Console shows "Fines loaded successfully"
- ✅ No red errors in console

## Contact Information

If you've tried all these steps and it's still not working:
1. Copy the console output
2. Copy the Network tab response
3. Copy the backend console output
4. Share these for further debugging
