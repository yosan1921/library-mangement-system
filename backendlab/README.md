# Library Management System - Backend

Spring Boot REST API for Library Management System with MongoDB Atlas.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MongoDB Atlas account

## Setup Instructions

### 1. Configure MongoDB Atlas

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user with username and password
4. Whitelist your IP address (or use 0.0.0.0/0 for testing)
5. Get your connection string

### 2. Update application.properties

Edit `src/main/resources/application.properties`:

```properties
spring.data.mongodb.uri=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/lms?retryWrites=true&w=majority
```

Replace:
- `YOUR_USERNAME` with your MongoDB username
- `YOUR_PASSWORD` with your MongoDB password
- `YOUR_CLUSTER` with your cluster name

### 3. Build and Run

```bash
cd backendlab
mvn clean install
mvn spring-boot:run
```

The server will start on http://localhost:8080

## API Endpoints

### Books
- `GET /api/books` - Get all books
- `GET /api/books/{id}` - Get book by ID
- `POST /api/books` - Add new book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book
- `GET /api/books/search?title=...&author=...&category=...` - Search books
- `GET /api/books/available` - Get available books

### Members
- `GET /api/members` - Get all members
- `GET /api/members/{id}` - Get member by ID
- `POST /api/members` - Add new member
- `PUT /api/members/{id}` - Update member
- `DELETE /api/members/{id}` - Delete member
- `GET /api/members/active` - Get active members

### Borrow/Return
- `POST /api/borrow/issue` - Issue a book
- `POST /api/borrow/return/{recordId}` - Return a book
- `GET /api/borrow/member/{memberID}` - Get member borrow history
- `GET /api/borrow/active` - Get active borrows
- `GET /api/borrow/overdue` - Get overdue books

### Reservations
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/member/{memberID}` - Get member reservations
- `GET /api/reservations/pending` - Get pending reservations
- `PUT /api/reservations/{id}/status` - Update reservation status
- `DELETE /api/reservations/{id}` - Cancel reservation

## Testing with cURL

### Add a Book
```bash
curl -X POST http://localhost:8080/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clean Code",
    "author": "Robert Martin",
    "category": "Programming",
    "isbn": "978-0132350884",
    "copiesAvailable": 5,
    "totalCopies": 5
  }'
```

### Add a Member
```bash
curl -X POST http://localhost:8080/api/members \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "contact": "john@example.com",
    "membershipID": "M001",
    "active": true,
    "role": "MEMBER"
  }'
```

### Issue a Book
```bash
curl -X POST http://localhost:8080/api/borrow/issue \
  -H "Content-Type: application/json" \
  -d '{
    "memberID": "MEMBER_ID_HERE",
    "bookID": "BOOK_ID_HERE"
  }'
```

## Project Structure

```
backendlab/
├── src/main/java/com/example/lms/
│   ├── controller/     # REST controllers
│   ├── service/        # Business logic
│   ├── repository/     # MongoDB repositories
│   ├── model/          # Data models
│   └── LmsApplication.java
├── src/main/resources/
│   └── application.properties
└── pom.xml
```
