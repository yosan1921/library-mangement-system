# Library Management System - Clean Project Structure

## Root Directory
```
library-management-system/
├── .git/                           # Git version control
├── .idea/                          # IDE configuration
├── .kiro/                          # Kiro IDE settings
├── backendlab/                     # Spring Boot backend
├── fronendlab/                     # Next.js frontend
├── COMPLETE_SYSTEM_GUIDE.md        # Full system documentation
├── FINAL_CHECKLIST.md              # Feature verification
├── OPTIMIZATION_SUMMARY.md         # Optimization details
├── PROJECT_STRUCTURE.md            # This file
├── QUICK_START_GUIDE.md            # Setup instructions
└── README.md                       # Project overview
```

## Backend Structure (backendlab/)
```
backendlab/
├── .mvn/                           # Maven wrapper
├── src/
│   ├── main/
│   │   ├── java/com/example/lms/
│   │   │   ├── config/
│   │   │   │   └── MongoConfig.java
│   │   │   ├── controller/        # 12 REST controllers
│   │   │   │   ├── AdminController.java
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── BookController.java
│   │   │   │   ├── BorrowController.java
│   │   │   │   ├── CustomErrorController.java
│   │   │   │   ├── FineController.java
│   │   │   │   ├── HomeController.java
│   │   │   │   ├── InitDataController.java
│   │   │   │   ├── LibrarianController.java
│   │   │   │   ├── MemberController.java
│   │   │   │   ├── ReportController.java
│   │   │   │   ├── ReservationController.java
│   │   │   │   └── SystemSettingsController.java
│   │   │   ├── model/              # 9 data models
│   │   │   │   ├── Admin.java
│   │   │   │   ├── Book.java
│   │   │   │   ├── BorrowRecord.java
│   │   │   │   ├── Fine.java
│   │   │   │   ├── Librarian.java
│   │   │   │   ├── Member.java
│   │   │   │   ├── Payment.java
│   │   │   │   ├── Reservation.java
│   │   │   │   └── SystemSettings.java
│   │   │   ├── repository/         # 9 MongoDB repositories
│   │   │   │   ├── AdminRepository.java
│   │   │   │   ├── BookRepository.java
│   │   │   │   ├── BorrowRecordRepository.java
│   │   │   │   ├── FineRepository.java
│   │   │   │   ├── LibrarianRepository.java
│   │   │   │   ├── MemberRepository.java
│   │   │   │   ├── PaymentRepository.java
│   │   │   │   ├── ReservationRepository.java
│   │   │   │   └── SystemSettingsRepository.java
│   │   │   ├── service/            # 11 business logic services
│   │   │   │   ├── AdminService.java
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── BackupService.java
│   │   │   │   ├── BookService.java
│   │   │   │   ├── BorrowService.java
│   │   │   │   ├── FineService.java
│   │   │   │   ├── LibrarianService.java
│   │   │   │   ├── MemberService.java
│   │   │   │   ├── ReportService.java
│   │   │   │   ├── ReservationService.java
│   │   │   │   └── SystemSettingsService.java
│   │   │   └── LmsApplication.java # Main application
│   │   └── resources/
│   │       ├── data/               # Empty (for future use)
│   │       └── application.properties
│   └── test/                       # Empty (for future tests)
├── target/                         # Build output (0.18 MB)
├── build.bat                       # Build script
├── mvnw                            # Maven wrapper (Unix)
├── mvnw.cmd                        # Maven wrapper (Windows)
├── pom.xml                         # Maven configuration
├── README.md                       # Backend documentation
├── rebuild.bat                     # Rebuild script
├── run.bat                         # Run script
└── start-backend.ps1               # PowerShell start script
```

## Frontend Structure (fronendlab/)
```
fronendlab/
├── .next/                          # Next.js build output
├── components/                     # 8 React components
│   ├── AdminLayout.js
│   ├── authGuard.js
│   ├── BookCard.js
│   ├── DashboardLayout.js
│   ├── LibrarianLayout.js
│   ├── LoadingSpinner.js
│   ├── MemberCard.js
│   ├── Navbar.js
│   └── Sidebar.js
├── node_modules/                   # NPM dependencies
├── pages/                          # Next.js pages
│   ├── admin/                      # 9 admin pages
│   │   ├── admins.js
│   │   ├── books.js
│   │   ├── borrows.js
│   │   ├── dashboard.js
│   │   ├── fines.js
│   │   ├── members.js
│   │   ├── reports.js
│   │   ├── reservations.js
│   │   └── settings.js
│   ├── librarian/                  # 6 librarian pages
│   │   ├── books.js
│   │   ├── dashboard.js
│   │   ├── fines.js
│   │   ├── issueBook.js
│   │   ├── members.js
│   │   └── returnBook.js
│   ├── member/                     # 5 member pages
│   │   ├── books.js
│   │   ├── borrows.js
│   │   ├── dashboard.js
│   │   ├── fines.js
│   │   └── reservations.js
│   ├── _app.js                     # App wrapper
│   ├── about.js                    # About page
│   ├── index.js                    # Landing page
│   └── login.js                    # Login page
├── services/                       # 7 API service files
│   ├── adminService.js
│   ├── authService.js
│   ├── bookService.js
│   ├── borrowService.js
│   ├── fineService.js
│   ├── memberService.js
│   ├── reportService.js
│   └── settingsService.js
├── styles/
│   └── globals.css                 # Global styles (minimal)
├── .gitignore
├── next.config.js                  # Next.js configuration
├── package-lock.json
├── package.json                    # NPM dependencies
└── README.md                       # Frontend documentation
```

## Key Statistics

### Backend
- **Controllers:** 12 (REST API endpoints)
- **Models:** 9 (MongoDB documents)
- **Services:** 11 (Business logic)
- **Repositories:** 9 (Data access)
- **Total Java Files:** 42

### Frontend
- **Pages:** 23 (Admin: 9, Librarian: 6, Member: 5, Public: 3)
- **Components:** 8 (Reusable UI components)
- **Services:** 7 (API integration)
- **Total JS Files:** 38

### Documentation
- **Essential Docs:** 5 files
- **Total Size:** ~50 KB (text only)

## Technology Stack

### Backend
- **Framework:** Spring Boot 3.x
- **Database:** MongoDB
- **Build Tool:** Maven
- **Java Version:** 17+
- **Port:** 8081

### Frontend
- **Framework:** Next.js 13
- **UI Library:** React 18
- **Styling:** Inline CSS (no external libraries)
- **HTTP Client:** Axios
- **Port:** 3000

## Features Implemented

### User Management
- ✅ Admin, Librarian, Member roles
- ✅ Authentication & Authorization
- ✅ Password encryption (BCrypt)
- ✅ User CRUD operations

### Book Management
- ✅ Book CRUD operations
- ✅ ISBN tracking
- ✅ Category management
- ✅ Copy tracking (available/total)
- ✅ Search & filter

### Borrowing System
- ✅ Issue books
- ✅ Return books
- ✅ Due date tracking
- ✅ Overdue detection
- ✅ Borrow history

### Reservation System
- ✅ Create reservations
- ✅ Approve/reject workflow
- ✅ Notification system
- ✅ Expiry tracking

### Fine Management
- ✅ Automatic fine calculation
- ✅ Payment tracking
- ✅ Fine waiving
- ✅ Payment history

### Reports & Analytics
- ✅ Book statistics
- ✅ Member activity
- ✅ Overdue reports
- ✅ Financial reports

### System Settings
- ✅ Configurable policies
- ✅ Notification settings
- ✅ Backup & restore

## Running the System

### Prerequisites
- Java 17+
- Node.js 16+
- MongoDB (local or cloud)

### Start Backend
```bash
cd backendlab
./run.bat          # Windows
./mvnw spring-boot:run  # Unix/Mac
```

### Start Frontend
```bash
cd fronendlab
npm install
npm run dev
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:8081
- Login: http://localhost:3000/login

## Test Credentials
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

## Maintenance

### Adding New Features
1. Backend: Add controller → service → repository
2. Frontend: Add page → service → component
3. Update documentation if needed

### Code Organization
- Keep controllers thin (delegate to services)
- Keep services focused (single responsibility)
- Use repositories for data access only
- Keep components small and reusable

### Best Practices
- Follow existing naming conventions
- Add comments for complex logic
- Handle errors gracefully
- Validate input data
- Use consistent styling

## Support

For issues or questions:
1. Check COMPLETE_SYSTEM_GUIDE.md
2. Check QUICK_START_GUIDE.md
3. Review code comments
4. Check browser/server console logs

---

**Last Updated:** February 22, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
