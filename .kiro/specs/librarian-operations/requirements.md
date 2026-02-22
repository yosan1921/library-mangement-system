# Requirements Document: Librarian Operations

## Introduction

This document specifies the requirements for the Librarian Operations feature in the Library Management System. The feature enables librarians to manage daily library operations including authentication, book management, borrowing operations, fine management, and member assistance. The system uses Spring Boot/Java with MongoDB for the backend and Next.js for the frontend.

## Glossary

- **Librarian_System**: The complete system that manages librarian operations
- **Auth_Module**: The authentication and authorization subsystem
- **Book_Manager**: The subsystem responsible for book CRUD operations
- **Borrow_Manager**: The subsystem that handles book issuing and returns
- **Fine_Manager**: The subsystem that manages fines and payments
- **Search_Module**: The subsystem that provides search and discovery functionality
- **Dashboard**: The frontend interface for librarian operations
- **Active_Librarian**: A librarian account with active status set to true
- **JWT_Token**: JSON Web Token used for session management
- **Borrow_Request**: A pending request from a member to borrow a book
- **Overdue_Book**: A borrowed book past its due date
- **Fine_Record**: A monetary penalty associated with a member
- **Payment_Transaction**: A record of fine payment

## Requirements

### Requirement 1: Librarian Authentication

**User Story:** As a librarian, I want to securely log in to the system, so that I can access librarian-specific operations.

#### Acceptance Criteria

1. WHEN a librarian submits valid credentials, THE Auth_Module SHALL authenticate the librarian and generate a JWT_Token
2. WHEN a librarian submits invalid credentials, THE Auth_Module SHALL reject the login attempt and return an error message
3. WHEN an inactive librarian attempts to log in, THE Auth_Module SHALL reject the login attempt
4. WHEN a JWT_Token is generated, THE Auth_Module SHALL include the librarian ID and role in the token payload
5. WHEN a JWT_Token expires, THE Auth_Module SHALL require re-authentication
6. THE Auth_Module SHALL hash passwords using BCrypt before storage

### Requirement 2: Librarian Authorization

**User Story:** As a system administrator, I want to ensure only authenticated librarians can access librarian operations, so that the system remains secure.

#### Acceptance Criteria

1. WHEN a request is made to a protected endpoint, THE Auth_Module SHALL validate the JWT_Token
2. IF a JWT_Token is missing or invalid, THEN THE Auth_Module SHALL return a 401 Unauthorized response
3. WHEN a valid JWT_Token is present, THE Auth_Module SHALL extract the librarian identity and allow the request
4. THE Auth_Module SHALL protect all book management, borrowing, and fine management endpoints

### Requirement 3: Book Addition

**User Story:** As a librarian, I want to add new books to the library catalog, so that members can discover and borrow them.

#### Acceptance Criteria

1. WHEN a librarian submits book details with all required fields, THE Book_Manager SHALL create a new book record
2. WHEN a librarian submits book details with missing required fields, THE Book_Manager SHALL reject the request and return validation errors
3. WHEN a book is created, THE Book_Manager SHALL set copiesAvailable equal to totalCopies
4. WHEN a book is created, THE Book_Manager SHALL generate a unique book ID
5. THE Book_Manager SHALL validate that ISBN follows a valid format
6. THE Book_Manager SHALL validate that totalCopies is a positive integer

### Requirement 4: Book Update

**User Story:** As a librarian, I want to update existing book information, so that the catalog remains accurate.

#### Acceptance Criteria

1. WHEN a librarian updates book details, THE Book_Manager SHALL modify the specified fields
2. WHEN a librarian attempts to update a non-existent book, THE Book_Manager SHALL return a 404 error
3. WHEN updating totalCopies, THE Book_Manager SHALL adjust copiesAvailable proportionally
4. THE Book_Manager SHALL update the book's updatedAt timestamp
5. THE Book_Manager SHALL validate all field constraints during updates

### Requirement 5: Book Deletion

**User Story:** As a librarian, I want to remove books from the catalog, so that outdated or damaged books are no longer available.

#### Acceptance Criteria

1. WHEN a librarian deletes a book with no active borrows, THE Book_Manager SHALL remove the book record
2. WHEN a librarian attempts to delete a book with active borrows, THE Book_Manager SHALL reject the deletion and return an error
3. WHEN a book is deleted, THE Book_Manager SHALL return a success confirmation

### Requirement 6: Book Issuance

**User Story:** As a librarian, I want to approve book borrow requests, so that members can take books home.

#### Acceptance Criteria

1. WHEN a librarian approves a pending borrow request, THE Borrow_Manager SHALL change the status to APPROVED
2. WHEN a borrow request is approved, THE Borrow_Manager SHALL decrement the book's copiesAvailable by one
3. WHEN a librarian attempts to approve a request for a book with zero copies available, THE Borrow_Manager SHALL reject the approval
4. WHEN a borrow request is approved, THE Borrow_Manager SHALL maintain the original issue date and due date
5. THE Borrow_Manager SHALL only allow approval of requests with PENDING status

### Requirement 7: Book Return Processing

**User Story:** As a librarian, I want to process book returns, so that books become available for other members.

#### Acceptance Criteria

1. WHEN a librarian processes a book return, THE Borrow_Manager SHALL set the return date to the current date
2. WHEN a book is returned, THE Borrow_Manager SHALL increment the book's copiesAvailable by one
3. WHEN a book is returned, THE Borrow_Manager SHALL change the borrow status to RETURNED
4. WHEN a book is returned after the due date, THE Borrow_Manager SHALL mark the record as overdue
5. THE Borrow_Manager SHALL only allow returns for borrows with APPROVED status

### Requirement 8: Fine Calculation

**User Story:** As a librarian, I want the system to automatically calculate fines for overdue books, so that penalties are applied consistently.

#### Acceptance Criteria

1. WHEN a book is returned after its due date, THE Fine_Manager SHALL calculate the fine based on days overdue
2. WHEN calculating a fine, THE Fine_Manager SHALL multiply days overdue by the fine rate per day
3. WHEN a fine is created, THE Fine_Manager SHALL set the status to UNPAID
4. WHEN a fine already exists for a borrow record, THE Fine_Manager SHALL reject duplicate fine creation
5. THE Fine_Manager SHALL use a configurable fine rate per day

### Requirement 9: Manual Fine Creation

**User Story:** As a librarian, I want to create manual fines for lost or damaged books, so that members are charged appropriately.

#### Acceptance Criteria

1. WHEN a librarian creates a manual fine, THE Fine_Manager SHALL create a fine record with the specified amount and reason
2. WHEN creating a manual fine, THE Fine_Manager SHALL set the status to UNPAID
3. WHEN creating a manual fine, THE Fine_Manager SHALL set the issue date to the current date
4. THE Fine_Manager SHALL validate that the fine amount is positive

### Requirement 10: Fine Payment Processing

**User Story:** As a librarian, I want to record fine payments, so that member accounts are updated correctly.

#### Acceptance Criteria

1. WHEN a librarian records a payment, THE Fine_Manager SHALL create a Payment_Transaction record
2. WHEN a payment is recorded, THE Fine_Manager SHALL update the fine's amountPaid
3. WHEN the amountPaid equals the fine amount, THE Fine_Manager SHALL change the status to PAID
4. WHEN the amountPaid is less than the fine amount, THE Fine_Manager SHALL change the status to PARTIALLY_PAID
5. WHEN a payment exceeds the remaining fine amount, THE Fine_Manager SHALL reject the payment
6. THE Fine_Manager SHALL validate that payment amounts are positive

### Requirement 11: Fine Waiver

**User Story:** As a librarian, I want to waive fines in exceptional circumstances, so that members are treated fairly.

#### Acceptance Criteria

1. WHEN a librarian waives a fine, THE Fine_Manager SHALL change the status to WAIVED
2. WHEN a fine is waived, THE Fine_Manager SHALL append the waiver reason to the fine record
3. WHEN a fine is waived, THE Fine_Manager SHALL set the paid date to the current date
4. THE Fine_Manager SHALL only allow waiving of fines with UNPAID or PARTIALLY_PAID status

### Requirement 12: Book Search

**User Story:** As a librarian, I want to search for books by various criteria, so that I can help members find books quickly.

#### Acceptance Criteria

1. WHEN a librarian searches by title, THE Search_Module SHALL return all books with titles containing the search term
2. WHEN a librarian searches by author, THE Search_Module SHALL return all books with authors containing the search term
3. WHEN a librarian searches by category, THE Search_Module SHALL return all books in that category
4. WHEN a librarian searches by ISBN, THE Search_Module SHALL return the exact book matching that ISBN
5. THE Search_Module SHALL perform case-insensitive searches for title and author
6. WHEN no books match the search criteria, THE Search_Module SHALL return an empty list

### Requirement 13: Borrow Request Management

**User Story:** As a librarian, I want to view and manage pending borrow requests, so that I can process them efficiently.

#### Acceptance Criteria

1. WHEN a librarian requests pending borrows, THE Borrow_Manager SHALL return all borrow requests with PENDING status
2. WHEN a librarian approves a borrow request, THE Borrow_Manager SHALL update the status to APPROVED
3. WHEN a librarian rejects a borrow request, THE Borrow_Manager SHALL update the status to REJECTED
4. THE Borrow_Manager SHALL only allow status changes for requests in PENDING status

### Requirement 14: Overdue Book Tracking

**User Story:** As a librarian, I want to view all overdue books, so that I can follow up with members.

#### Acceptance Criteria

1. WHEN a librarian requests overdue books, THE Borrow_Manager SHALL return all borrow records marked as overdue
2. WHEN the current date exceeds a borrow's due date, THE Borrow_Manager SHALL mark the record as overdue
3. THE Borrow_Manager SHALL include member and book details in overdue listings

### Requirement 15: Librarian Dashboard

**User Story:** As a librarian, I want a dashboard showing key metrics, so that I can monitor library operations at a glance.

#### Acceptance Criteria

1. WHEN a librarian accesses the dashboard, THE Dashboard SHALL display total books count
2. WHEN a librarian accesses the dashboard, THE Dashboard SHALL display available books count
3. WHEN a librarian accesses the dashboard, THE Dashboard SHALL display active borrows count
4. WHEN a librarian accesses the dashboard, THE Dashboard SHALL display pending requests count
5. WHEN a librarian accesses the dashboard, THE Dashboard SHALL display overdue books count
6. WHEN a librarian accesses the dashboard, THE Dashboard SHALL display total outstanding fines amount
7. THE Dashboard SHALL refresh metrics when the page loads

### Requirement 16: Book Management Interface

**User Story:** As a librarian, I want a user-friendly interface for managing books, so that I can perform operations efficiently.

#### Acceptance Criteria

1. WHEN a librarian accesses the book management page, THE Dashboard SHALL display a list of all books
2. WHEN a librarian clicks add book, THE Dashboard SHALL display a form with all required fields
3. WHEN a librarian clicks edit on a book, THE Dashboard SHALL display a pre-filled form
4. WHEN a librarian clicks delete on a book, THE Dashboard SHALL display a confirmation dialog
5. THE Dashboard SHALL display validation errors inline with form fields
6. THE Dashboard SHALL show success messages after successful operations

### Requirement 17: Borrow Management Interface

**User Story:** As a librarian, I want an interface to manage borrowing operations, so that I can process requests and returns efficiently.

#### Acceptance Criteria

1. WHEN a librarian accesses the borrow management page, THE Dashboard SHALL display pending requests
2. WHEN a librarian accesses the borrow management page, THE Dashboard SHALL display active borrows
3. WHEN a librarian clicks approve on a request, THE Dashboard SHALL send an approval request to the backend
4. WHEN a librarian clicks reject on a request, THE Dashboard SHALL send a rejection request to the backend
5. WHEN a librarian clicks return on an active borrow, THE Dashboard SHALL send a return request to the backend
6. THE Dashboard SHALL update the display after each operation

### Requirement 18: Fine Management Interface

**User Story:** As a librarian, I want an interface to manage fines, so that I can process payments and waivers efficiently.

#### Acceptance Criteria

1. WHEN a librarian accesses the fine management page, THE Dashboard SHALL display all unpaid and partially paid fines
2. WHEN a librarian clicks record payment, THE Dashboard SHALL display a payment form
3. WHEN a librarian clicks waive fine, THE Dashboard SHALL display a reason input dialog
4. WHEN a librarian submits a payment, THE Dashboard SHALL send the payment details to the backend
5. THE Dashboard SHALL display payment history for each fine
6. THE Dashboard SHALL show the total outstanding amount for each member

### Requirement 19: Session Management

**User Story:** As a librarian, I want my session to remain active while I work, so that I don't have to log in repeatedly.

#### Acceptance Criteria

1. WHEN a JWT_Token is valid, THE Auth_Module SHALL allow continued access
2. WHEN a JWT_Token expires, THE Dashboard SHALL redirect to the login page
3. WHEN a librarian logs out, THE Dashboard SHALL clear the stored JWT_Token
4. THE Dashboard SHALL store the JWT_Token securely in browser storage
5. THE Dashboard SHALL include the JWT_Token in all API requests

### Requirement 20: Error Handling

**User Story:** As a librarian, I want clear error messages when operations fail, so that I can understand and resolve issues.

#### Acceptance Criteria

1. WHEN a backend operation fails, THE Librarian_System SHALL return a descriptive error message
2. WHEN a validation error occurs, THE Dashboard SHALL display field-specific error messages
3. WHEN a network error occurs, THE Dashboard SHALL display a user-friendly error notification
4. WHEN an authentication error occurs, THE Dashboard SHALL redirect to the login page
5. THE Librarian_System SHALL log all errors for debugging purposes
