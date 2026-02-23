# Library Management System - Complete Implementation Guide

## System Overview

A full-stack Library Management System with three user roles: Admin, Librarian, and Member. Built with Spring Boot backend and Next.js frontend.

## Architecture

### Backend (Spring Boot + MongoDB)
- **Port**: 8081
- **Database**: MongoDB
- **API Base URL**: http://localhost:8081/api

### Frontend (Next.js)
- **Port**: 3000
- **Framework**: Next.js with React
- **Styling**: Inline CSS (no external dependencies)

## User Roles & Capabilities

### 1. Admin
**Access**: Full system control

**Features**:
- Dashboard with comprehensive statistics
- Manage Books (CRUD operations)
- Manage Members (CRUD operations)
- Manage Librarians (CRUD operations)
- Manage Admins (CRUD operations)
- Borrowing & Returns management
- Reservations management
- Fines & Payments tracking
- Reports & Analytics
- System Settings configuration

**Routes**:
- `/admin/dashboard`
- `/admin/books`
- `/admin/members`
- `/admin/borrows`
- `/admin/reservations`
- `/admin/fines`
- `/admin/reports`
- `/admin/settings`
- `/admin/admins`

### 2. Librarian
**Access**: Daily operations management

**Features**:
- Dashboard with key statistics
- Manage Books (Add/Edit/Delete)
- Issue Books to members
- Process Book Returns
- View Members & their history
- Manage Fines (Mark paid/Waive)
- Search and filter capabilities

**Routes**:
- `/librarian/dashboard`
- `/librarian/books`
- `/librarian/issueBook`
- `/librarian/returnBook`
- `/librarian/members`
- `/librarian/fines`

**Main Responsibilities**:
- Add/Update/Delete books
- Issue books to members
- Receive returned books
- Manage fines
- Help users find books

### 3. Member
**Access**: Personal library services

**Features**:
- Personal dashboard with statistics
- Browse available books
- Reserve books
- View borrow history
- View and pay fines
- Track due dates
- Manage reservations

**Routes**:
- `/member/dashboard`
- `/member/books`
- `/member/borrows`
- `/member/reservations`
- `/member/fines`

**Capabilities**:
- Browse and search books
- Reserve available books
- View active and past borrows
- Track upcoming due dates
- Pay fines online
- Cancel reservations

## Key Features Implemented

### Authentication & Authorization
- Role-based login system
- Secure password handling (BCrypt)
- Session management
- Route protection by role

### Book Management
- Complete CRUD operations
- ISBN tracking
- Category management
- Availability tracking
- Copy management (total vs available)
- Search and filter functionality

### Borrowing System
- Issue books to members
- Track due dates
- Process returns
- Automatic fine calculation for overdue books
- Borrow history tracking
- Status management (active/returned)

### Reservation System
- Book reservation by members
- Status tracking (PENDING/APPROVED/FULFILLED/CANCELLED/EXPIRED)
- Notification system
- Expiry date management
- Queue management

### Fine Management
- Automatic fine generation for overdue books
- Payment tracking
- Fine waiving capability (librarian/admin)
- Payment history
- Total unpaid calculation

### Dashboard Analytics
- Real-time statistics
- Active borrows count
- Overdue books tracking
- Available books count
- Member statistics
- Fine summaries
- Recent activity feeds

### Search & Filter
- Book search by title, author, ISBN, category
- Member search by name, email, membership ID
- Filter by status (active/inactive, paid/unpaid)
- Category filtering
- Availability filtering

## API Endpoints

### Books
```
GET    /api/books              - Get all books
GET    /api/books/{id}         - Get book by ID
POST   /api/books              - Add new book
PUT    /api/books/{id}         - Update book
DELETE /api/books/{id}         - Delete book
GET    /api/books/available    - Get available books
GET    /api/books/search       - Search books
```

### Members
```
GET    /api/members            - Get all members
GET    /api/members/{id}       - Get member by ID
POST   /api/members            - Register member
PUT    /api/members/{id}       - Update member
DELETE /api/members/{id}       - Delete member
GET    /api/members/active     - Get active members
```

### Borrowing
```
GET    /api/borrow/active      - Get active borrows
GET    /api/borrow/overdue     - Get overdue books
POST   /api/borrow/issue       - Issue book
POST   /api/borrow/return/{id} - Return book
GET    /api/borrow/member/{id} - Get member history
```

### Reservations
```
GET    /api/reservations                    - Get all reservations
POST   /api/reservations                    - Create reservation
GET    /api/reservations/member/{id}        - Get member reservations
DELETE /api/reservations/{id}               - Cancel reservation
POST   /api/reservations/{id}/approve       - Approve reservation
POST   /api/reservations/{id}/fulfill       - Fulfill reservation
GET    /api/reservations/pending            - Get pending reservations
```

### Fines
```
GET    /api/fines                - Get all fines
GET    /api/fines/unpaid         - Get unpaid fines
GET    /api/fines/paid           - Get paid fines
GET    /api/fines/member/{id}    - Get member fines
POST   /api/fines/{id}/pay       - Mark fine as paid
POST   /api/fines/{id}/waive     - Waive fine
```

### Authentication
```
POST   /api/auth/login           - User login
POST   /api/auth/logout          - User logout
GET    /api/auth/me              - Get current user
```

## Component Structure

### Shared Components
- **Navbar**: Top navigation bar with user info
- **Sidebar**: Role-based side navigation menu
- **BookCard**: Display book information
- **MemberCard**: Display member information
- **LoadingSpinner**: Loading state indicator
- **DashboardLayout**: Consistent layout wrapper
- **AdminLayout**: Admin-specific layout
- **LibrarianLayout**: Librarian-specific layout

### Services
- **authService**: Authentication operations
- **bookService**: Book CRUD operations
- **memberService**: Member management
- **borrowService**: Borrowing operations
- **fineService**: Fine management
- **reportService**: Analytics and reports
- **settingsService**: System settings

## Design Patterns

### Color Scheme
- Primary Blue: #3498db
- Success Green: #27ae60
- Danger Red: #e74c3c
- Warning Orange: #f39c12
- Dark: #2c3e50
- Light Gray: #ecf0f1
- Text Gray: #7f8c8d

### Layout Pattern
- Fixed sidebar (260px width)
- Main content area with left margin
- Responsive design with mobile hamburger menu
- Card-based content display
- Modal dialogs for forms

### Status Indicators
- Color-coded badges
- Icon usage for quick recognition
- Hover effects for interactivity
- Loading states for async operations

## Running the System

### Backend
```bash
cd backendlab
./mvnw spring-boot:run
# or
./run.bat
```

### Frontend
```bash
cd fronendlab
npm install
npm run dev
```

### Access URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8081
- Login Page: http://localhost:3000/login

### Test Credentials
```
Admin:
  Username: admin
  Password: admin123

Librarian:
  Username: librarian
  Password: lib123

Member:
  Username: member
  Password: mem123
```

## Database Collections

### MongoDB Collections
- `books` - Book inventory
- `members` - Library members
- `librarians` - Librarian accounts
- `admins` - Admin accounts
- `borrowRecords` - Borrowing history
- `reservations` - Book reservations
- `fines` - Fine records
- `payments` - Payment history
- `systemSettings` - System configuration

## Security Features

- Password encryption with BCrypt
- Role-based access control
- Session management
- CORS configuration
- Input validation
- SQL injection prevention (MongoDB)
- XSS protection

## Future Enhancements

1. **Email Notifications**
   - Overdue reminders
   - Reservation availability alerts
   - Fine payment reminders

2. **Advanced Search**
   - Full-text search
   - Advanced filters
   - Saved searches

3. **Reports**
   - Most borrowed books
   - Member activity reports
   - Fine collection reports
   - Inventory reports

4. **Barcode System**
   - Barcode generation for books
   - Barcode scanning for quick checkout
   - Mobile app integration

5. **Online Payments**
   - Payment gateway integration
   - Payment history
   - Receipt generation

6. **Book Recommendations**
   - Based on borrow history
   - Popular books
   - Category-based suggestions

7. **Multi-language Support**
   - Internationalization
   - RTL support
   - Language switcher

8. **Mobile App**
   - React Native app
   - Push notifications
   - Offline mode

## Troubleshooting

### Backend Issues
- Check MongoDB is running
- Verify port 8081 is available
- Check application.properties configuration
- Review console logs for errors

### Frontend Issues
- Clear browser cache
- Check port 3000 is available
- Verify API URL in service files
- Check browser console for errors

### Common Problems
1. **CORS errors**: Check backend CORS configuration
2. **404 errors**: Verify API endpoints match
3. **Login fails**: Check credentials and backend connection
4. **Data not loading**: Check network tab for API responses

## Support & Documentation

For additional help:
- Check backend logs in console
- Review browser developer tools
- Verify MongoDB connection
- Check API responses in network tab

## License

This is an educational project for learning purposes.
