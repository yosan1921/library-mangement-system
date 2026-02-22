# Design Document: Library Management System

## Overview

The Library Management System (LMS) is a three-tier web application built with Spring Boot backend, React/Next.js frontend, and MongoDB Atlas database. The system implements role-based access control (RBAC) for three user types: Admin, Librarian, and Member. The architecture follows RESTful API design principles with clear separation between presentation, business logic, and data access layers.

The system handles core library operations: book cataloging, member management, borrowing/returning books, reservations, search/filtering, and reporting. It is designed to support 500 concurrent users with sub-2-second response times.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│              (React + Next.js - fronendlab/)                │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │  Admin   │  │Librarian │  │  Member  │                │
│  │Dashboard │  │Dashboard │  │Dashboard │                │
│  └──────────┘  └──────────┘  └──────────┘                │
│                                                             │
│  ┌─────────────────────────────────────────────┐          │
│  │         Services (API Client Layer)          │          │
│  │  bookService | memberService | borrowService │          │
│  └─────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend Layer                           │
│           (Spring Boot - backendlab/src/main/)              │
│                                                             │
│  ┌─────────────────────────────────────────────┐          │
│  │              Controllers                     │          │
│  │  BookController | MemberController |         │          │
│  │  BorrowController | ReservationController   │          │
│  └─────────────────────────────────────────────┘          │
│                            │                                │
│  ┌─────────────────────────────────────────────┐          │
│  │              Services                        │          │
│  │  BookService | MemberService |               │          │
│  │  BorrowService | ReservationService |        │          │
│  │  NotificationService | ReportService         │          │
│  └─────────────────────────────────────────────┘          │
│                            │                                │
│  ┌─────────────────────────────────────────────┐          │
│  │            Repositories                      │          │
│  │  BookRepository | MemberRepository |         │          │
│  │  BorrowRecordRepository |                    │          │
│  │  ReservationRepository                       │          │
│  └─────────────────────────────────────────────┘          │
│                                                             │
│  ┌─────────────────────────────────────────────┐          │
│  │         Configuration & Security             │          │
│  │  SecurityConfig | MongoConfig | CorsConfig   │          │
│  └─────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ MongoDB Driver
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                           │
│                   (MongoDB Atlas)                           │
│                                                             │
│  Collections: books | members | borrowRecords |            │
│               reservations | users                          │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Backend**: Spring Boot 3.x with Java 17+
- **Frontend**: React 18+ with Next.js 13+
- **Database**: MongoDB Atlas (cloud-hosted)
- **Security**: Spring Security with JWT authentication
- **API**: RESTful APIs with JSON payloads
- **Build Tools**: Maven (backend), npm (frontend)

## Components and Interfaces

### Backend Components

#### 1. Model Layer (backendlab/src/main/java/com/example/lms/model/)

**Book.java**
```java
class Book {
    String id;              // MongoDB ObjectId
    String title;
    String author;
    String category;
    String isbn;            // Unique identifier
    int copiesAvailable;
    int totalCopies;
    boolean active;
    Date createdAt;
    Date updatedAt;
}
```

**Member.java**
```java
class Member {
    String id;              // MongoDB ObjectId
    String name;
    String email;
    String phone;
    String membershipId;    // Unique identifier
    boolean active;
    Date registrationDate;
    Date updatedAt;
}
```

**BorrowRecord.java**
```java
class BorrowRecord {
    String id;              // MongoDB ObjectId
    String memberId;        // Reference to Member
    String bookId;          // Reference to Book
    Date issueDate;
    Date dueDate;
    Date returnDate;        // null if not returned
    boolean overdue;
    Date createdAt;
}
```

**Reservation.java**
```java
class Reservation {
    String id;              // MongoDB ObjectId
    String memberId;        // Reference to Member
    String bookId;          // Reference to Book
    Date reservationDate;
    String status;          // "PENDING", "FULFILLED", "CANCELLED"
    Date notifiedAt;
    Date createdAt;
}
```

**User.java**
```java
class User {
    String id;              // MongoDB ObjectId
    String username;
    String password;        // Hashed
    String role;            // "ADMIN", "LIBRARIAN", "MEMBER"
    String memberId;        // Reference to Member (if role is MEMBER)
    boolean active;
}
```

#### 2. Repository Layer (backendlab/src/main/java/com/example/lms/repository/)

Uses Spring Data MongoDB interfaces:

```java
interface BookRepository extends MongoRepository<Book, String> {
    Optional<Book> findByIsbn(String isbn);
    List<Book> findByTitleContainingIgnoreCase(String title);
    List<Book> findByAuthorContainingIgnoreCase(String author);
    List<Book> findByCategory(String category);
    List<Book> findByCopiesAvailableGreaterThan(int count);
}

interface MemberRepository extends MongoRepository<Member, String> {
    Optional<Member> findByMembershipId(String membershipId);
    Optional<Member> findByEmail(String email);
    List<Member> findByActiveTrue();
}

interface BorrowRecordRepository extends MongoRepository<BorrowRecord, String> {
    List<BorrowRecord> findByMemberId(String memberId);
    List<BorrowRecord> findByBookId(String bookId);
    List<BorrowRecord> findByReturnDateIsNull();
    List<BorrowRecord> findByDueDateBeforeAndReturnDateIsNull(Date date);
    Optional<BorrowRecord> findByMemberIdAndBookIdAndReturnDateIsNull(String memberId, String bookId);
}

interface ReservationRepository extends MongoRepository<Reservation, String> {
    List<Reservation> findByBookIdAndStatus(String bookId, String status);
    List<Reservation> findByMemberId(String memberId);
    Optional<Reservation> findByMemberIdAndBookIdAndStatus(String memberId, String bookId, String status);
    List<Reservation> findByBookIdAndStatusOrderByReservationDateAsc(String bookId, String status);
}

interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
}
```

#### 3. Service Layer (backendlab/src/main/java/com/example/lms/service/)

**BookService.java**
```java
interface BookService {
    Book addBook(Book book);
    Book updateBook(String id, Book book);
    void deleteBook(String id);
    Optional<Book> getBookById(String id);
    Optional<Book> getBookByIsbn(String isbn);
    List<Book> searchBooks(String query, String category, Boolean available);
    void decrementCopies(String bookId);
    void incrementCopies(String bookId);
}
```

**MemberService.java**
```java
interface MemberService {
    Member registerMember(Member member);
    Member updateMember(String id, Member member);
    void deactivateMember(String id);
    Optional<Member> getMemberById(String id);
    Optional<Member> getMemberByMembershipId(String membershipId);
    List<Member> getAllActiveMembers();
}
```

**BorrowService.java**
```java
interface BorrowService {
    BorrowRecord issueBook(String memberId, String bookId);
    BorrowRecord returnBook(String borrowRecordId);
    List<BorrowRecord> getMemberBorrowHistory(String memberId);
    List<BorrowRecord> getCurrentLoans(String memberId);
    List<BorrowRecord> getOverdueRecords();
    boolean isBookBorrowedByMember(String memberId, String bookId);
}
```

**ReservationService.java**
```java
interface ReservationService {
    Reservation createReservation(String memberId, String bookId);
    void fulfillReservation(String reservationId);
    void cancelReservation(String reservationId);
    List<Reservation> getMemberReservations(String memberId);
    List<Reservation> getPendingReservationsForBook(String bookId);
    Optional<Reservation> getNextPendingReservation(String bookId);
}
```

**NotificationService.java**
```java
interface NotificationService {
    void notifyReservationAvailable(String memberId, String bookId);
    void notifyDueDateReminder(String memberId, String bookId, Date dueDate);
    void notifyOverdue(String memberId, String bookId);
    void sendEmail(String to, String subject, String body);
}
```

**ReportService.java**
```java
interface ReportService {
    List<BorrowRecord> getOverdueBooks();
    List<BookStatistics> getMostBorrowedBooks(int limit);
    List<MemberStatistics> getMemberActivityReport();
}
```

#### 4. Controller Layer (backendlab/src/main/java/com/example/lms/controller/)

RESTful endpoints:

**BookController.java**
- POST /api/books - Add new book
- PUT /api/books/{id} - Update book
- DELETE /api/books/{id} - Delete book
- GET /api/books/{id} - Get book by ID
- GET /api/books/search - Search books with query params

**MemberController.java**
- POST /api/members - Register member
- PUT /api/members/{id} - Update member
- PATCH /api/members/{id}/deactivate - Deactivate member
- GET /api/members/{id} - Get member by ID
- GET /api/members - Get all active members

**BorrowController.java**
- POST /api/borrows/issue - Issue book
- POST /api/borrows/{id}/return - Return book
- GET /api/borrows/member/{memberId} - Get member borrow history
- GET /api/borrows/member/{memberId}/current - Get current loans
- GET /api/borrows/overdue - Get overdue records

**ReservationController.java**
- POST /api/reservations - Create reservation
- DELETE /api/reservations/{id} - Cancel reservation
- GET /api/reservations/member/{memberId} - Get member reservations

**ReportController.java**
- GET /api/reports/overdue - Get overdue books report
- GET /api/reports/most-borrowed - Get most borrowed books
- GET /api/reports/member-activity - Get member activity report

**AuthController.java**
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout
- GET /api/auth/me - Get current user info

#### 5. Configuration Layer (backendlab/src/main/java/com/example/lms/config/)

**SecurityConfig.java**
- JWT-based authentication
- Role-based authorization
- CORS configuration
- Password encoding (BCrypt)

**MongoConfig.java**
- MongoDB connection settings
- Database name configuration
- Connection pooling

### Frontend Components

#### Pages Structure (fronendlab/pages/)

**admin/**
- dashboard.js - Admin dashboard with system overview
- books.js - Book management interface
- members.js - Member management interface
- reports.js - Reports and analytics

**librarian/**
- dashboard.js - Librarian dashboard
- issue-return.js - Book issue and return interface
- search.js - Book search interface

**member/**
- dashboard.js - Member dashboard
- browse.js - Browse and search books
- history.js - Borrowing history
- reservations.js - View and manage reservations

#### Components (fronendlab/components/)

**BookCard.js** - Display book information
**MemberCard.js** - Display member information
**Navbar.js** - Top navigation bar
**Sidebar.js** - Side navigation menu
**SearchBar.js** - Book search component
**BorrowTable.js** - Display borrow records
**ReservationList.js** - Display reservations

#### Services (fronendlab/services/)

**bookService.js**
```javascript
async function searchBooks(query, category, available)
async function getBookById(id)
async function addBook(book)
async function updateBook(id, book)
async function deleteBook(id)
```

**memberService.js**
```javascript
async function registerMember(member)
async function updateMember(id, member)
async function deactivateMember(id)
async function getMemberById(id)
async function getAllMembers()
```

**borrowService.js**
```javascript
async function issueBook(memberId, bookId)
async function returnBook(borrowRecordId)
async function getMemberHistory(memberId)
async function getCurrentLoans(memberId)
async function getOverdueBooks()
```

**reservationService.js**
```javascript
async function createReservation(memberId, bookId)
async function cancelReservation(id)
async function getMemberReservations(memberId)
```

**authService.js**
```javascript
async function login(username, password)
async function logout()
async function getCurrentUser()
```

## Data Models

### MongoDB Collections

**books**
```json
{
  "_id": "ObjectId",
  "title": "string",
  "author": "string",
  "category": "string",
  "isbn": "string (unique)",
  "copiesAvailable": "number",
  "totalCopies": "number",
  "active": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```
Indexes: isbn (unique), title, author, category, copiesAvailable

**members**
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "phone": "string",
  "membershipId": "string (unique)",
  "active": "boolean",
  "registrationDate": "Date",
  "updatedAt": "Date"
}
```
Indexes: membershipId (unique), email (unique), active

**borrowRecords**
```json
{
  "_id": "ObjectId",
  "memberId": "string (ref: members._id)",
  "bookId": "string (ref: books._id)",
  "issueDate": "Date",
  "dueDate": "Date",
  "returnDate": "Date (nullable)",
  "overdue": "boolean",
  "createdAt": "Date"
}
```
Indexes: memberId, bookId, returnDate, dueDate, compound(memberId, bookId, returnDate)

**reservations**
```json
{
  "_id": "ObjectId",
  "memberId": "string (ref: members._id)",
  "bookId": "string (ref: books._id)",
  "reservationDate": "Date",
  "status": "string (PENDING|FULFILLED|CANCELLED)",
  "notifiedAt": "Date (nullable)",
  "createdAt": "Date"
}
```
Indexes: compound(bookId, status), memberId, compound(memberId, bookId, status)

**users**
```json
{
  "_id": "ObjectId",
  "username": "string (unique)",
  "password": "string (hashed)",
  "role": "string (ADMIN|LIBRARIAN|MEMBER)",
  "memberId": "string (ref: members._id, nullable)",
  "active": "boolean"
}
```
Indexes: username (unique)

### Data Validation Rules

1. **Book Validation**
   - title: required, 1-500 characters
   - author: required, 1-200 characters
   - category: required, from predefined list
   - isbn: required, unique, valid ISBN format
   - copiesAvailable: >= 0, <= totalCopies
   - totalCopies: >= 1

2. **Member Validation**
   - name: required, 1-200 characters
   - email: required, valid email format, unique
   - phone: required, valid phone format
   - membershipId: required, unique, alphanumeric

3. **BorrowRecord Validation**
   - memberId: required, must exist in members collection
   - bookId: required, must exist in books collection
   - issueDate: required, cannot be future date
   - dueDate: required, must be after issueDate
   - returnDate: if present, must be >= issueDate

4. **Reservation Validation**
   - memberId: required, must exist in members collection
   - bookId: required, must exist in books collection
   - status: required, must be PENDING, FULFILLED, or CANCELLED

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified the following consolidations:

1. **Book CRUD operations** (2.1, 2.2) can be combined into a single round-trip property
2. **Member CRUD operations** (3.1, 3.2) can be combined into a single round-trip property
3. **Copies available invariant** (4.2, 5.2, 10.2) should be one comprehensive property covering borrow, return, and non-negativity
4. **Validation properties** (2.5, 3.5, 10.1) can be combined into a general input validation property
5. **Search properties** (7.1, 7.2, 7.3, 7.4, 7.5) can be consolidated into fewer properties about search correctness
6. **Authorization properties** (1.3, 11.5) both test role-based access and can be combined

### Core Correctness Properties

**Property 1: Authentication with valid credentials establishes session**
*For any* valid username and password combination, authenticating should successfully create a session with the correct user role and permissions.
**Validates: Requirements 1.1**

**Property 2: Authentication with invalid credentials is rejected**
*For any* invalid credentials (wrong password, non-existent user, or malformed input), authentication should fail and return an appropriate error without creating a session.
**Validates: Requirements 1.2**

**Property 3: Role-based authorization enforcement**
*For any* authenticated user and any system feature, access should be granted if and only if the user's role has permission for that feature.
**Validates: Requirements 1.3, 11.5**

**Property 4: Session expiration requires re-authentication**
*For any* expired session, attempting to perform any operation should fail with an authentication error until the user re-authenticates.
**Validates: Requirements 1.4**

**Property 5: Book data round-trip consistency**
*For any* valid book data, creating a book and then retrieving it should return equivalent data with all fields preserved (title, author, category, ISBN, copies).
**Validates: Requirements 2.1, 2.2**

**Property 6: Book deletion with active borrows marks inactive**
*For any* book with at least one unreturned borrow record, attempting to delete the book should mark it as inactive rather than removing it from the database.
**Validates: Requirements 2.3**

**Property 7: ISBN uniqueness constraint**
*For any* existing book with ISBN X, attempting to add another book with the same ISBN X should be rejected with a uniqueness constraint error.
**Validates: Requirements 2.4**

**Property 8: Invalid book data rejection**
*For any* book data that violates validation rules (missing required fields, invalid ISBN format, negative copies, etc.), the add/update operation should be rejected with specific validation errors.
**Validates: Requirements 2.5, 10.1**

**Property 9: Member data round-trip consistency**
*For any* valid member data, registering a member and then retrieving them should return equivalent data with all fields preserved (name, email, phone, membershipId).
**Validates: Requirements 3.1, 3.2**

**Property 10: Member deactivation prevents borrowing**
*For any* deactivated member, attempting to issue a book to that member should be rejected, while their historical borrow records remain accessible.
**Validates: Requirements 3.3**

**Property 11: Membership ID uniqueness constraint**
*For any* existing member with membershipId X, attempting to register another member with the same membershipId X should be rejected with a uniqueness constraint error.
**Validates: Requirements 3.4**

**Property 12: Invalid member data rejection**
*For any* member data that violates validation rules (invalid email format, invalid phone format, missing required fields), the registration/update operation should be rejected with specific validation errors.
**Validates: Requirements 3.5, 10.1**

**Property 13: Book issue creates borrow record**
*For any* valid member and available book, issuing the book should create a borrow record with correct memberId, bookId, issueDate, and dueDate (14 days from issue).
**Validates: Requirements 4.1, 4.5**

**Property 14: Copies available invariant**
*For any* sequence of book operations (add, issue, return), the copiesAvailable count should always satisfy: 0 <= copiesAvailable <= totalCopies, and should decrement on issue and increment on return.
**Validates: Requirements 4.2, 5.2, 10.2**

**Property 15: Inactive member cannot borrow**
*For any* inactive member, attempting to issue a book should be rejected with an appropriate error message.
**Validates: Requirements 4.4**

**Property 16: Book return updates record and availability**
*For any* active borrow record, processing a return should set the returnDate, increment copiesAvailable, and mark as overdue if returnDate > dueDate.
**Validates: Requirements 5.1, 5.2, 5.3**

**Property 17: Return with pending reservations triggers notification**
*For any* book with pending reservations, when the book is returned and becomes available, the notification