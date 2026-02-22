# Quick Start Guide - Library Management System

## Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- MongoDB (running on localhost:27017)
- Maven (included via mvnw)

## Step 1: Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
# or
mongod
```

## Step 2: Start Backend

```bash
cd backendlab

# Windows
run.bat

# Mac/Linux
./mvnw spring-boot:run
```

Backend will start on: **http://localhost:8081**

## Step 3: Start Frontend

Open a new terminal:

```bash
cd fronendlab
npm install
npm run dev
```

Frontend will start on: **http://localhost:3000**

## Step 4: Access the System

Open your browser and go to: **http://localhost:3000**

### Login Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Access: Full system control

**Librarian Account:**
- Username: `librarian`
- Password: `lib123`
- Access: Daily operations

**Member Account:**
- Username: `member`
- Password: `mem123`
- Access: Personal library services

## Step 5: Initialize Sample Data (Optional)

If you want to populate the system with sample data:

1. Login as Admin
2. Navigate to System Settings
3. Click "Initialize Sample Data"

Or use the API endpoint:
```bash
curl -X POST http://localhost:8081/api/init/sample-data
```

## Quick Feature Tour

### As Admin
1. Go to `/admin/dashboard` - View system statistics
2. Go to `/admin/books` - Add some books
3. Go to `/admin/members` - Add some members
4. Go to `/admin/borrows` - Manage borrowing

### As Librarian
1. Go to `/librarian/dashboard` - View daily stats
2. Go to `/librarian/books` - Manage book inventory
3. Go to `/librarian/issueBook` - Issue a book to a member
4. Go to `/librarian/returnBook` - Process returns
5. Go to `/librarian/fines` - Manage fines

### As Member
1. Go to `/member/dashboard` - View your account
2. Go to `/member/books` - Browse available books
3. Reserve a book
4. Go to `/member/borrows` - Check your borrowed books
5. Go to `/member/fines` - View and pay fines

## Common Tasks

### Add a New Book (Librarian/Admin)
1. Login as Librarian or Admin
2. Navigate to Books page
3. Click "Add New Book"
4. Fill in book details
5. Click "Add Book"

### Issue a Book (Librarian)
1. Login as Librarian
2. Go to "Issue Book"
3. Select Member from dropdown
4. Select Book from available books
5. Click "Issue Book"

### Return a Book (Librarian)
1. Login as Librarian
2. Go to "Return Book"
3. Find the active borrow
4. Click "Return Book"
5. System automatically calculates fines if overdue

### Reserve a Book (Member)
1. Login as Member
2. Go to "Browse Books"
3. Find a book you want
4. Click "Reserve Book"
5. Check "My Reservations" for status

### Pay a Fine (Member)
1. Login as Member
2. Go to "My Fines"
3. View unpaid fines
4. Click "Pay Now" on a fine
5. Confirm payment

## Troubleshooting

### Backend won't start
- Check if port 8081 is already in use
- Verify MongoDB is running
- Check Java version: `java -version`

### Frontend won't start
- Check if port 3000 is already in use
- Run `npm install` again
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Can't login
- Verify backend is running (check http://localhost:8081/api/test)
- Check browser console for errors
- Verify credentials are correct

### Data not showing
- Check browser Network tab for API errors
- Verify backend logs for errors
- Check MongoDB connection

### CORS errors
- Verify backend CORS configuration in application.properties
- Check if frontend is running on port 3000

## API Testing

Test if backend is working:

```bash
# Test endpoint
curl http://localhost:8081/api/test

# Get all books
curl http://localhost:8081/api/books

# Login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Development Tips

### Hot Reload
- Frontend: Automatically reloads on file changes
- Backend: Restart required for Java changes

### Debugging
- Frontend: Use browser DevTools (F12)
- Backend: Check console output for logs

### Database
- View MongoDB data: Use MongoDB Compass or mongo shell
- Database name: `library_management`

## Next Steps

1. Explore all three user roles
2. Try different features
3. Add your own books and members
4. Test the borrowing workflow
5. Experiment with reservations and fines

## Need Help?

- Check `COMPLETE_SYSTEM_GUIDE.md` for detailed documentation
- Review `LIBRARIAN_FEATURES_GUIDE.md` for librarian-specific features
- Check backend logs for API errors
- Use browser DevTools to debug frontend issues

## System URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081
- **Login Page**: http://localhost:3000/login
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Librarian Dashboard**: http://localhost:3000/librarian/dashboard
- **Member Dashboard**: http://localhost:3000/member/dashboard

Happy Library Managing! 📚
