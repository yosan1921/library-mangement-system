# Design Document: Librarian Operations

## Overview

The Librarian Operations feature provides a comprehensive system for librarians to manage daily library operations. The system is built on a Spring Boot/Java backend with MongoDB for data persistence and a Next.js frontend for the user interface.

The design follows a layered architecture with clear separation between:
- **Authentication & Authorization Layer**: JWT-based security
- **Service Layer**: Business logic for books, borrowing, and fines
- **Data Layer**: MongoDB repositories
- **Presentation Layer**: Next.js React components

The system leverages existing models (Book, BorrowRecord, Fine, Payment, Member, Librarian) and extends existing services (BookService, BorrowService, FineService, LibrarianService) with new authentication and authorization capabilities.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │ Book Manager │  │ Fine Manager │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Module  │  │Borrow Manager│  │Search Module │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    JWT Token in Headers
                            │
┌─────────────────────────────────────────────────────────────┐
│                  Spring Boot Backend                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Authentication Filter (JWT)                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │AuthController│  │BookController│  │FineController│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  AuthService │  │ BookService  │  │ FineService  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │BorrowService │  │LibrarianRepo │  │  BookRepo    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                         MongoDB
```

### Authentication Flow

```
Librarian → Login Form → AuthController.login()
                              ↓
                    Validate credentials
                              ↓
                    Generate JWT Token
                              ↓
                    Return token to client
                              ↓
            Client stores token in localStorage
                              ↓
        All subsequent requests include token in Authorization header
                              ↓
            JwtAuthenticationFilter validates token
                              ↓
                    Extract librarian identity
                              ↓
                Allow request to proceed
```

## Components and Interfaces

### Backend Components

#### 1. Authentication Service

**Purpose**: Handle librarian authentication and JWT token generation

**Interface**:
```java
public class AuthService {
    // Authenticate librarian and generate JWT token
    public AuthResponse login(String username, String password);
    
    // Validate JWT token and extract claims
    public LibrarianDetails validateToken(String token);
    
    // Generate new JWT token
    private String generateToken(Librarian librarian);
    
    // Verify password against stored hash
    private boolean verifyPassword(String rawPassword, String hashedPassword);
}
```

**AuthResponse Model**:
```java
public class AuthResponse {
    private String token;
    private String librarianId;
    private String name;
    private String email;
    private long expiresIn; // milliseconds
}
```

#### 2. JWT Authentication Filter

**Purpose**: Intercept HTTP requests and validate JWT tokens

**Interface**:
```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException;
    
    // Extract token from Authorization header
    private String extractToken(HttpServletRequest request);
    
    // Validate token and set authentication context
    private void authenticateRequest(String token);
}
```

#### 3. Authentication Controller

**Purpose**: Expose authentication endpoints

**Interface**:
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request);
    
    @PostMapping("/logout")
    public ResponseEntity<String> logout();
    
    @GetMapping("/me")
    public ResponseEntity<Librarian> getCurrentLibrarian();
}
```

**LoginRequest Model**:
```java
public class LoginRequest {
    private String username;
    private String password;
}
```

#### 4. Enhanced Book Controller

**Purpose**: Add authorization to existing book endpoints

**New Endpoints**:
```java
// All existing endpoints remain, but add @PreAuthorize annotation
@PreAuthorize("hasRole('LIBRARIAN')")
@PostMapping
public ResponseEntity<?> addBook(@RequestBody Book book);

@PreAuthorize("hasRole('LIBRARIAN')")
@PutMapping("/{id}")
public ResponseEntity<?> updateBook(@PathVariable String id, @RequestBody Book book);

@PreAuthorize("hasRole('LIBRARIAN')")
@DeleteMapping("/{id}")
public ResponseEntity<?> deleteBook(@PathVariable String id);
```

#### 5. Enhanced Borrow Controller

**Purpose**: Add librarian-specific borrow management endpoints

**New Endpoints**:
```java
@PreAuthorize("hasRole('LIBRARIAN')")
@GetMapping("/pending")
public ResponseEntity<List<BorrowRecord>> getPendingRequests();

@PreAuthorize("hasRole('LIBRARIAN')")
@PatchMapping("/{id}/approve")
public ResponseEntity<?> approveBorrowRequest(@PathVariable String id);

@PreAuthorize("hasRole('LIBRARIAN')")
@PatchMapping("/{id}/reject")
public ResponseEntity<?> rejectBorrowRequest(@PathVariable String id);

@PreAuthorize("hasRole('LIBRARIAN')")
@PatchMapping("/{id}/return")
public ResponseEntity<?> returnBook(@PathVariable String id);

@PreAuthorize("hasRole('LIBRARIAN')")
@GetMapping("/overdue")
public ResponseEntity<List<BorrowRecord>> getOverdueBooks();
```

#### 6. Enhanced Fine Controller

**Purpose**: Add librarian-specific fine management endpoints

**New Endpoints**:
```java
@PreAuthorize("hasRole('LIBRARIAN')")
@PostMapping("/calculate/{borrowRecordId}")
public ResponseEntity<?> calculateFine(@PathVariable String borrowRecordId);

@PreAuthorize("hasRole('LIBRARIAN')")
@PostMapping("/manual")
public ResponseEntity<?> createManualFine(@RequestBody ManualFineRequest request);

@PreAuthorize("hasRole('LIBRARIAN')")
@PostMapping("/{fineId}/payment")
public ResponseEntity<?> recordPayment(
    @PathVariable String fineId,
    @RequestBody PaymentRequest request
);

@PreAuthorize("hasRole('LIBRARIAN')")
@PatchMapping("/{fineId}/waive")
public ResponseEntity<?> waiveFine(
    @PathVariable String fineId,
    @RequestBody WaiveRequest request
);

@PreAuthorize("hasRole('LIBRARIAN')")
@GetMapping("/unpaid")
public ResponseEntity<List<Fine>> getUnpaidFines();
```

#### 7. Dashboard Statistics Service

**Purpose**: Aggregate statistics for librarian dashboard

**Interface**:
```java
public class DashboardService {
    public DashboardStats getStatistics();
}
```

**DashboardStats Model**:
```java
public class DashboardStats {
    private long totalBooks;
    private long availableBooks;
    private long activeBorrows;
    private long pendingRequests;
    private long overdueBooks;
    private double totalOutstandingFines;
}
```

### Frontend Components

#### 1. Authentication Context

**Purpose**: Manage authentication state across the application

**Interface**:
```typescript
interface AuthContextType {
    token: string | null;
    librarian: LibrarianInfo | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>(null);
```

#### 2. API Client

**Purpose**: Centralized HTTP client with JWT token injection

**Interface**:
```typescript
class ApiClient {
    private baseURL: string;
    private getToken: () => string | null;
    
    constructor(baseURL: string, getToken: () => string | null);
    
    async get<T>(endpoint: string): Promise<T>;
    async post<T>(endpoint: string, data: any): Promise<T>;
    async put<T>(endpoint: string, data: any): Promise<T>;
    async patch<T>(endpoint: string, data: any): Promise<T>;
    async delete<T>(endpoint: string): Promise<T>;
}
```

#### 3. Login Page Component

**Purpose**: Librarian login interface

**Component Structure**:
```typescript
const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    
    const handleSubmit = async (e: FormEvent) => {
        // Validate inputs
        // Call login function
        // Handle errors
        // Redirect on success
    };
    
    return (
        // Login form UI
    );
};
```

#### 4. Dashboard Component

**Purpose**: Main librarian dashboard with statistics

**Component Structure**:
```typescript
interface DashboardStats {
    totalBooks: number;
    availableBooks: number;
    activeBorrows: number;
    pendingRequests: number;
    overdueBooks: number;
    totalOutstandingFines: number;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchDashboardStats();
    }, []);
    
    const fetchDashboardStats = async () => {
        // Fetch stats from API
    };
    
    return (
        // Dashboard UI with stat cards
    );
};
```

#### 5. Book Management Component

**Purpose**: Interface for CRUD operations on books

**Component Structure**:
```typescript
const BookManagement: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    
    const handleAddBook = async (book: Book) => {
        // Call API to add book
        // Refresh book list
    };
    
    const handleUpdateBook = async (id: string, book: Book) => {
        // Call API to update book
        // Refresh book list
    };
    
    const handleDeleteBook = async (id: string) => {
        // Show confirmation
        // Call API to delete book
        // Refresh book list
    };
    
    return (
        // Book list with add/edit/delete actions
    );
};
```

#### 6. Borrow Management Component

**Purpose**: Interface for managing borrow requests and returns

**Component Structure**:
```typescript
const BorrowManagement: React.FC = () => {
    const [pendingRequests, setPendingRequests] = useState<BorrowRecord[]>([]);
    const [activeBorrows, setActiveBorrows] = useState<BorrowRecord[]>([]);
    const [overdueBooks, setOverdueBooks] = useState<BorrowRecord[]>([]);
    
    const handleApprove = async (id: string) => {
        // Call API to approve request
        // Refresh lists
    };
    
    const handleReject = async (id: string) => {
        // Call API to reject request
        // Refresh lists
    };
    
    const handleReturn = async (id: string) => {
        // Call API to process return
        // Check if overdue and calculate fine
        // Refresh lists
    };
    
    return (
        // Tabs for pending/active/overdue with action buttons
    );
};
```

#### 7. Fine Management Component

**Purpose**: Interface for managing fines and payments

**Component Structure**:
```typescript
const FineManagement: React.FC = () => {
    const [fines, setFines] = useState<Fine[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
    
    const handleRecordPayment = async (
        fineId: string,
        amount: number,
        method: string,
        notes: string
    ) => {
        // Call API to record payment
        // Refresh fine list
    };
    
    const handleWaiveFine = async (fineId: string, reason: string) => {
        // Call API to waive fine
        // Refresh fine list
    };
    
    const handleCreateManualFine = async (
        memberId: string,
        amount: number,
        reason: string
    ) => {
        // Call API to create manual fine
        // Refresh fine list
    };
    
    return (
        // Fine list with payment/waive actions
    );
};
```

#### 8. Search Component

**Purpose**: Book search interface

**Component Structure**:
```typescript
const BookSearch: React.FC = () => {
    const [searchType, setSearchType] = useState<'title' | 'author' | 'isbn' | 'category'>('title');
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Book[]>([]);
    
    const handleSearch = async () => {
        // Call appropriate search API based on searchType
        // Display results
    };
    
    return (
        // Search form with type selector and results display
    );
};
```

#### 9. Protected Route Component

**Purpose**: Restrict access to authenticated librarians only

**Component Structure**:
```typescript
const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated]);
    
    if (!isAuthenticated) {
        return null;
    }
    
    return <>{children}</>;
};
```

## Data Models

### Existing Models (Reference)

All existing models remain unchanged:
- **Book**: id, title, author, isbn, category, totalCopies, copiesAvailable
- **BorrowRecord**: id, memberID, bookID, issueDate, dueDate, returnDate, status, overdue
- **Fine**: id, memberID, borrowRecordID, amount, amountPaid, reason, issueDate, paidDate, status
- **Payment**: id, fineID, memberID, amount, paymentDate, paymentMethod, notes
- **Member**: id, name, email, phone, membershipDate, active
- **Librarian**: id, username, password, name, email, phone, active, createdAt, updatedAt

### New Request/Response Models

#### ManualFineRequest
```java
public class ManualFineRequest {
    private String memberId;
    private Double amount;
    private String reason;
}
```

#### PaymentRequest
```java
public class PaymentRequest {
    private Double amount;
    private String paymentMethod; // CASH, CARD, ONLINE
    private String notes;
}
```

#### WaiveRequest
```java
public class WaiveRequest {
    private String reason;
}
```

### Frontend Type Definitions

```typescript
interface Book {
    id: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
    totalCopies: number;
    copiesAvailable: number;
}

interface BorrowRecord {
    id: string;
    memberID: string;
    bookID: string;
    issueDate: string;
    dueDate: string;
    returnDate?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
    overdue: boolean;
}

interface Fine {
    id: string;
    memberID: string;
    borrowRecordID?: string;
    amount: number;
    amountPaid: number;
    amountDue: number;
    reason: string;
    issueDate: string;
    paidDate?: string;
    status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'WAIVED';
}

interface Payment {
    id: string;
    fineID: string;
    memberID: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    notes: string;
}

interface LibrarianInfo {
    id: string;
    username: string;
    name: string;
    email: string;
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Authentication Properties

**Property 1: Valid credential authentication**
*For any* active librarian with valid credentials, authenticating should generate a JWT token that contains the librarian ID and role in its payload.
**Validates: Requirements 1.1, 1.4**

**Property 2: Invalid credential rejection**
*For any* invalid credentials (wrong username or wrong password), the authentication attempt should be rejected with an error message.
**Validates: Requirements 1.2**

**Property 3: Password hashing**
*For any* librarian account, the stored password should be a BCrypt hash, not the plaintext password.
**Validates: Requirements 1.6**

**Property 4: Token validation**
*For any* request to a protected endpoint with a valid JWT token, the system should extract the librarian identity and allow the request to proceed.
**Validates: Requirements 2.1, 2.3**

**Property 5: Missing or invalid token rejection**
*For any* request to a protected endpoint with a missing or invalid JWT token, the system should return a 401 Unauthorized response.
**Validates: Requirements 2.2**

### Book Management Properties

**Property 6: Book creation invariants**
*For any* valid book submission with all required fields, creating the book should result in a new record where copiesAvailable equals totalCopies and the book has a unique ID.
**Validates: Requirements 3.1, 3.3, 3.4**

**Property 7: Book creation validation**
*For any* book submission with missing required fields, the system should reject the request and return validation errors.
**Validates: Requirements 3.2**

**Property 8: ISBN format validation**
*For any* book submission, if the ISBN does not follow a valid format, the system should reject the request.
**Validates: Requirements 3.5**

**Property 9: Total copies validation**
*For any* book submission, if totalCopies is not a positive integer, the system should reject the request.
**Validates: Requirements 3.6**

**Property 10: Book update field modification**
*For any* existing book and valid update data, updating the book should modify the specified fields and update the updatedAt timestamp.
**Validates: Requirements 4.1, 4.4**

**Property 11: Non-existent book update rejection**
*For any* non-existent book ID, attempting to update should return a 404 error.
**Validates: Requirements 4.2**

**Property 12: Total copies proportional adjustment**
*For any* book with existing borrows, when totalCopies is updated, copiesAvailable should be adjusted proportionally to maintain the same ratio of borrowed to available copies.
**Validates: Requirements 4.3**

**Property 13: Book deletion with no borrows**
*For any* book with no active borrows, deleting the book should remove the record from the system.
**Validates: Requirements 5.1**

**Property 14: Book deletion with active borrows rejection**
*For any* book with active borrows, attempting to delete should be rejected with an error.
**Validates: Requirements 5.2**

### Borrowing Properties

**Property 15: Borrow request approval**
*For any* pending borrow request for a book with available copies, approving the request should change the status to APPROVED, decrement copiesAvailable by one, and preserve the original issue date and due date.
**Validates: Requirements 6.1, 6.2, 6.4**

**Property 16: Borrow approval state validation**
*For any* borrow request not in PENDING status, attempting to approve should be rejected.
**Validates: Requirements 6.5**

**Property 17: Book return processing**
*For any* approved borrow, processing a return should set the return date to the current date, increment copiesAvailable by one, and change the status to RETURNED.
**Validates: Requirements 7.1, 7.2, 7.3**

**Property 18: Overdue marking on return**
*For any* approved borrow, if the return date is after the due date, the system should mark the record as overdue.
**Validates: Requirements 7.4**

**Property 19: Book return state validation**
*For any* borrow not in APPROVED status, attempting to process a return should be rejected.
**Validates: Requirements 7.5**

**Property 20: Borrow request rejection**
*For any* pending borrow request, rejecting the request should change the status to REJECTED.
**Validates: Requirements 13.3**

**Property 21: Pending requests query**
*For any* set of borrow records, querying for pending requests should return only records with PENDING status.
**Validates: Requirements 13.1**

**Property 22: Overdue books query**
*For any* set of borrow records, querying for overdue books should return only records marked as overdue.
**Validates: Requirements 14.1**

**Property 23: Overdue marking by date**
*For any* borrow record where the current date exceeds the due date, the system should mark the record as overdue.
**Validates: Requirements 14.2**

### Fine Management Properties

**Property 24: Overdue fine calculation**
*For any* book returned after its due date, calculating the fine should create a fine record with amount equal to days overdue multiplied by the fine rate per day, and status set to UNPAID.
**Validates: Requirements 8.1, 8.3**

**Property 25: Duplicate fine rejection**
*For any* borrow record that already has an associated fine, attempting to create another fine should be rejected.
**Validates: Requirements 8.4**

**Property 26: Manual fine creation**
*For any* valid manual fine request with positive amount, creating the fine should result in a new fine record with the specified amount and reason, status set to UNPAID, and issue date set to the current date.
**Validates: Requirements 9.1, 9.3**

**Property 27: Fine amount validation**
*For any* fine creation request with non-positive amount, the system should reject the request.
**Validates: Requirements 9.4**

**Property 28: Payment recording**
*For any* unpaid or partially paid fine and valid payment amount, recording a payment should create a Payment_Transaction record and update the fine's amountPaid.
**Validates: Requirements 10.1, 10.2**

**Property 29: Payment status transitions**
*For any* fine, when a payment is recorded: if the new amountPaid equals the fine amount, the status should change to PAID; if the new amountPaid is less than the fine amount, the status should change to PARTIALLY_PAID.
**Validates: Requirements 10.3, 10.4**

**Property 30: Overpayment rejection**
*For any* fine, if a payment amount would cause amountPaid to exceed the fine amount, the system should reject the payment.
**Validates: Requirements 10.5**

**Property 31: Payment amount validation**
*For any* payment request with non-positive amount, the system should reject the request.
**Validates: Requirements 10.6**

**Property 32: Fine waiver**
*For any* unpaid or partially paid fine, waiving the fine should change the status to WAIVED, append the waiver reason to the fine record, and set the paid date to the current date.
**Validates: Requirements 11.1, 11.2, 11.3**

**Property 33: Fine waiver state validation**
*For any* fine not in UNPAID or PARTIALLY_PAID status, attempting to waive should be rejected.
**Validates: Requirements 11.4**

### Search Properties

**Property 34: Title search**
*For any* set of books and search term, searching by title should return all books whose titles contain the search term (case-insensitive).
**Validates: Requirements 12.1, 12.5**

**Property 35: Author search**
*For any* set of books and search term, searching by author should return all books whose authors contain the search term (case-insensitive).
**Validates: Requirements 12.2, 12.5**

**Property 36: Category search**
*For any* set of books and category, searching by category should return all books in that exact category.
**Validates: Requirements 12.3**

**Property 37: ISBN search**
*For any* set of books and ISBN, searching by ISBN should return the exact book with that ISBN, or no results if no match exists.
**Validates: Requirements 12.4**

### Error Handling Properties

**Property 38: Descriptive error messages**
*For any* backend operation that fails, the system should return a descriptive error message explaining the failure.
**Validates: Requirements 20.1**

## Error Handling

### Authentication Errors

- **Invalid Credentials**: Return 401 with message "Invalid username or password"
- **Inactive Account**: Return 403 with message "Account is inactive"
- **Expired Token**: Return 401 with message "Token has expired"
- **Missing Token**: Return 401 with message "Authentication required"
- **Invalid Token**: Return 401 with message "Invalid authentication token"

### Validation Errors

- **Missing Required Fields**: Return 400 with field-specific messages
- **Invalid ISBN Format**: Return 400 with message "ISBN must be in valid format (10 or 13 digits)"
- **Invalid Total Copies**: Return 400 with message "Total copies must be a positive integer"
- **Invalid Fine Amount**: Return 400 with message "Fine amount must be positive"
- **Invalid Payment Amount**: Return 400 with message "Payment amount must be positive"

### Business Logic Errors

- **Book Not Found**: Return 404 with message "Book not found"
- **Borrow Record Not Found**: Return 404 with message "Borrow record not found"
- **Fine Not Found**: Return 404 with message "Fine not found"
- **No Copies Available**: Return 400 with message "No copies available for this book"
- **Book Has Active Borrows**: Return 400 with message "Cannot delete book with active borrows"
- **Invalid Status Transition**: Return 400 with message "Cannot perform this action on a record with status X"
- **Duplicate Fine**: Return 400 with message "Fine already exists for this borrow record"
- **Overpayment**: Return 400 with message "Payment amount exceeds remaining fine amount"

### Database Errors

- **Connection Failure**: Return 500 with message "Database connection error"
- **Duplicate Key**: Return 409 with message "Record with this identifier already exists"
- **Constraint Violation**: Return 400 with message describing the constraint violation

### Error Response Format

All error responses follow this JSON structure:
```json
{
    "error": "Error type",
    "message": "Descriptive error message",
    "timestamp": "ISO 8601 timestamp",
    "path": "Request path"
}
```

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit testing and property-based testing as complementary approaches:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs

Together, these approaches provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness.

### Property-Based Testing

**Library Selection**: Use **jqwik** for Java property-based testing

**Configuration**:
- Minimum 100 iterations per property test
- Each property test must reference its design document property
- Tag format: `@Tag("Feature: librarian-operations, Property N: [property text]")`

**Property Test Examples**:

```java
@Property
@Tag("Feature: librarian-operations, Property 1: Valid credential authentication")
void validCredentialsShouldGenerateTokenWithLibrarianInfo(
    @ForAll @AlphaChars @StringLength(min = 5, max = 20) String username,
    @ForAll @AlphaChars @StringLength(min = 8, max = 20) String password
) {
    // Create librarian with credentials
    Librarian librarian = createActiveLibrarian(username, password);
    
    // Authenticate
    AuthResponse response = authService.login(username, password);
    
    // Verify token contains librarian info
    assertNotNull(response.getToken());
    LibrarianDetails details = authService.validateToken(response.getToken());
    assertEquals(librarian.getId(), details.getId());
    assertNotNull(details.getRole());
}

@Property
@Tag("Feature: librarian-operations, Property 6: Book creation invariants")
void createdBookShouldHaveCopiesAvailableEqualToTotalCopies(
    @ForAll @AlphaChars @StringLength(min = 5, max = 100) String title,
    @ForAll @AlphaChars @StringLength(min = 5, max = 50) String author,
    @ForAll @Positive int totalCopies
) {
    // Create book
    Book book = new Book();
    book.setTitle(title);
    book.setAuthor(author);
    book.setTotalCopies(totalCopies);
    book.setIsbn(generateValidISBN());
    book.setCategory("Fiction");
    
    Book created = bookService.addBook(book);
    
    // Verify invariants
    assertEquals(totalCopies, created.getCopiesAvailable());
    assertNotNull(created.getId());
}

@Property
@Tag("Feature: librarian-operations, Property 15: Borrow request approval")
void approvingPendingRequestShouldUpdateStatusAndDecrementCopies(
    @ForAll @Positive int initialCopies
) {
    // Setup
    Book book = createBookWithCopies(initialCopies);
    Member member = createMember();
    BorrowRecord request = createPendingBorrowRequest(member.getId(), book.getId());
    
    // Approve
    BorrowRecord approved = borrowService.approveBorrowRequest(request.getId());
    
    // Verify
    assertEquals("APPROVED", approved.getStatus());
    assertEquals(request.getIssueDate(), approved.getIssueDate());
    assertEquals(request.getDueDate(), approved.getDueDate());
    
    Book updatedBook = bookService.getBookById(book.getId()).get();
    assertEquals(initialCopies - 1, updatedBook.getCopiesAvailable());
}
```

### Unit Testing

**Framework**: JUnit 5 for Java, Jest for Next.js frontend

**Focus Areas**:
- Specific examples demonstrating correct behavior
- Edge cases (inactive librarian login, zero copies available, empty search results)
- Error conditions (invalid ISBN, overpayment, duplicate fines)
- Integration points between components

**Unit Test Examples**:

```java
@Test
void inactiveLibrarianShouldNotBeAbleToLogin() {
    // Create inactive librarian
    Librarian librarian = createLibrarian("inactive_user", "password");
    librarian.setActive(false);
    librarianRepository.save(librarian);
    
    // Attempt login
    assertThrows(AuthenticationException.class, () -> {
        authService.login("inactive_user", "password");
    });
}

@Test
void cannotApproveRequestWhenNoCopiesAvailable() {
    // Setup book with zero copies
    Book book = createBookWithCopies(0);
    Member member = createMember();
    BorrowRecord request = createPendingBorrowRequest(member.getId(), book.getId());
    
    // Attempt approval
    assertThrows(RuntimeException.class, () -> {
        borrowService.approveBorrowRequest(request.getId());
    });
}

@Test
void searchWithNoResultsShouldReturnEmptyList() {
    // Search for non-existent book
    List<Book> results = bookService.searchByTitle("NonExistentBook12345");
    
    // Verify empty results
    assertTrue(results.isEmpty());
}
```

### Frontend Testing

**Framework**: Jest + React Testing Library

**Focus Areas**:
- Component rendering with various props
- User interactions (form submissions, button clicks)
- API integration (mocked responses)
- Authentication flow
- Error display

**Frontend Test Example**:

```typescript
describe('LoginPage', () => {
    it('should display error message on invalid credentials', async () => {
        // Mock failed login
        mockApiClient.post.mockRejectedValue({
            response: { data: { message: 'Invalid credentials' } }
        });
        
        render(<LoginPage />);
        
        // Fill form
        fireEvent.change(screen.getByLabelText('Username'), {
            target: { value: 'invalid_user' }
        });
        fireEvent.change(screen.getByLabelText('Password'), {
            target: { value: 'wrong_password' }
        });
        
        // Submit
        fireEvent.click(screen.getByText('Login'));
        
        // Verify error display
        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });
});
```

### Integration Testing

**Focus**: Test complete flows across multiple components

**Key Flows to Test**:
1. Login → Dashboard → Book Management → Add Book
2. Login → Borrow Management → Approve Request → Verify Book Copies Decremented
3. Login → Borrow Management → Return Book → Calculate Fine → Record Payment
4. Login → Search → View Results → Issue Book

### Test Coverage Goals

- **Backend Services**: 90% code coverage
- **Backend Controllers**: 85% code coverage
- **Frontend Components**: 80% code coverage
- **Property Tests**: All 38 correctness properties implemented
- **Unit Tests**: All edge cases and error conditions covered
