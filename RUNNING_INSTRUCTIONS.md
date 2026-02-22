# Library Management System - Running Instructions

## ✅ System Status: FULLY OPERATIONAL

Both backend and frontend are currently running!

### Current Running Services:

1. **Backend (Spring Boot)**
   - Status: ✅ RUNNING
   - URL: http://localhost:8080
   - Database: Connected to MongoDB Atlas
   - Process ID: 3

2. **Frontend (React/Next.js)**
   - Status: ✅ RUNNING
   - URL: http://localhost:3000
   - Process ID: 6

## Access the Application

Open your web browser and go to:
```
http://localhost:3000
```

You'll see the home page with three role options:
- Admin Dashboard
- Librarian Dashboard
- Member Dashboard

## Testing the System

### 1. Admin Functions
- Go to http://localhost:3000/admin/dashboard
- Navigate to "Manage Books" to add/edit/delete books
- Navigate to "Manage Members" to add/edit/delete members

### 2. Librarian Functions
- Go to http://localhost:3000/librarian/dashboard
- Use "Issue Book" to lend books to members
- Use "Return Book" to process returns

### 3. Member Functions
- Go to http://localhost:3000/member/dashboard
- Use "Search Books" to find books
- Use "My Reservations" to manage reservations

## API Endpoints (Backend)

The backend REST API is available at http://localhost:8080/api

### Books API
- GET http://localhost:8080/api/books - List all books
- POST http://localhost:8080/api/books - Add a book
- PUT http://localhost:8080/api/books/{id} - Update a book
- DELETE http://localhost:8080/api/books/{id} - Delete a book

### Members API
- GET http://localhost:8080/api/members - List all members
- POST http://localhost:8080/api/members - Add a member
- PUT http://localhost:8080/api/members/{id} - Update a member
- DELETE http://localhost:8080/api/members/{id} - Delete a member

### Borrow/Return API
- POST http://localhost:8080/api/borrow/issue - Issue a book
- POST http://localhost:8080/api/borrow/return/{recordId} - Return a book
- GET http://localhost:8080/api/borrow/active - Get active borrows
- GET http://localhost:8080/api/borrow/overdue - Get overdue books

### Reservations API
- POST http://localhost:8080/api/reservations - Create reservation
- GET http://localhost:8080/api/reservations/member/{memberID} - Get member reservations
- DELETE http://localhost:8080/api/reservations/{id} - Cancel reservation

## Stopping the Services

To stop the running services, use the process IDs:

### Stop Backend:
```powershell
Stop-Process -Id 3 -Force
```

### Stop Frontend:
```powershell
Stop-Process -Id 6 -Force
```

## Restarting the Services

### Restart Backend:
```bash
cd backendlab
mvn spring-boot:run
```

### Restart Frontend:
```bash
cd fronendlab
node node_modules\next\dist\bin\next dev
```

Or use npm:
```bash
npm run dev
```

## Database Information

- **Database**: MongoDB Atlas
- **Connection**: mongodb+srv://yo2_n:***@cluster0.091wrcs.mongodb.net/lms
- **Collections**:
  - books
  - members
  - borrowRecords
  - reservations

## Troubleshooting

### Frontend won't start with npm run dev
Use the direct node command instead:
```bash
node node_modules\next\dist\bin\next dev
```

### Backend connection issues
Check that MongoDB Atlas credentials are correct in:
```
backendlab/src/main/resources/application.properties
```

### Port already in use
- Backend uses port 8080
- Frontend uses port 3000
- Make sure no other services are using these ports

## Features Implemented

✅ Book Management (CRUD)
✅ Member Management (CRUD)
✅ Borrow/Return System
✅ Reservation System
✅ Search Functionality
✅ Role-based Dashboards
✅ Statistics Display
✅ MongoDB Integration
✅ REST API
✅ Responsive UI

## Next Steps

1. Add sample data through the Admin dashboard
2. Test the complete workflow:
   - Add books
   - Add members
   - Issue books
   - Return books
   - Create reservations
3. Explore all three role dashboards

Enjoy your Library Management System! 🎉
