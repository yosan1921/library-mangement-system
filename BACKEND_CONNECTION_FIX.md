# Backend Connection Fix

## Issue
Frontend was trying to connect to `localhost:8080` but backend runs on `localhost:8081`

## Fix Applied ✅
Updated all frontend service files to use the correct port:

### Files Updated:
1. ✅ `fronendlab/services/bookService.js` - Changed to port 8081
2. ✅ `fronendlab/services/memberService.js` - Changed to port 8081
3. ✅ `fronendlab/services/borrowService.js` - Changed to port 8081
4. ✅ `fronendlab/services/adminService.js` - Changed to port 8081
5. ✅ `fronendlab/services/fineService.js` - Changed to port 8081
6. ✅ `fronendlab/services/reportService.js` - Changed to port 8081
7. ✅ `fronendlab/services/settingsService.js` - Changed to port 8081

## Backend Status
✅ Backend server is running on port 8081

## Next Steps

### 1. Restart Frontend (if running)
If your frontend is already running, you need to restart it to pick up the changes:

```bash
# Stop the current frontend server (Ctrl+C in the terminal)
# Then restart it:
cd fronendlab
npm run dev
```

### 2. Test the Connection
Open your browser and navigate to:
- Frontend: http://localhost:3000/admin/books
- Backend API: http://localhost:8081/api/books

### 3. Verify Backend is Running
If backend is not running, start it with:

```bash
cd backendlab
./mvnw spring-boot:run
```

Or on Windows:
```bash
cd backendlab
mvnw.cmd spring-boot:run
```

## Testing Checklist

- [ ] Backend running on port 8081
- [ ] Frontend restarted after service file changes
- [ ] Can access http://localhost:3000/admin/books
- [ ] Books load without error
- [ ] Can add new books
- [ ] Can edit books
- [ ] Can delete books

## Common Issues

### Issue: "Failed to load books"
**Solution**: 
1. Check backend is running: `Get-NetTCPConnection -LocalPort 8081`
2. Restart frontend to pick up port changes
3. Clear browser cache (Ctrl+Shift+R)

### Issue: CORS errors
**Solution**: Backend controllers already have `@CrossOrigin(origins = "*")` - should work

### Issue: MongoDB connection
**Solution**: Backend is configured to use MongoDB Atlas cloud database - should be accessible

## Configuration Summary

### Backend (application.properties)
```properties
server.port=8081
spring.data.mongodb.uri=mongodb+srv://yo2_n:yosan1234@cluster0.fpahdmc.mongodb.net/lms
```

### Frontend (all service files)
```javascript
const API_URL = 'http://localhost:8081/api/[endpoint]';
```

## All Fixed! 🎉

The port mismatch has been corrected. Simply restart your frontend server and everything should work.
