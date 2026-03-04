package com.example.lms.model;

// Spring Data MongoDB annotations for document mapping
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
// Java time API for date handling
import java.time.LocalDate;

/**
 * Reservation Entity - Represents a book reservation request
 * 
 * This class manages book reservations when requested books are not currently available.
 * It implements a queue system where members can reserve books and get notified when
 * the books become available for borrowing.
 * 
 * Reservation Workflow:
 * 1. Member requests a book that is currently unavailable (all copies borrowed)
 * 2. System creates a PENDING reservation
 * 3. When book becomes available, system notifies member and marks as APPROVED
 * 4. Member has limited time to borrow the book before reservation expires
 * 5. Reservation is marked as FULFILLED when member borrows the book
 * 
 * Status Transitions:
 * - PENDING: Initial state when reservation is created
 * - APPROVED: Book is available and member has been notified
 * - CANCELLED: Member or librarian cancelled the reservation
 * - FULFILLED: Member has borrowed the reserved book
 * 
 * Key Features:
 * - Automatic notification when books become available
 * - Expiry system to prevent indefinite reservations
 * - Queue management for popular books
 * - Integration with notification services (email/SMS)
 * 
 * Related Entities:
 * - Member: The person making the reservation (memberID reference)
 * - Book: The book being reserved (bookID reference)
 * - BorrowRecord: Created when reservation is fulfilled
 * 
 * MongoDB Collection: "reservations"
 */
@Document(collection = "reservations") // Maps this class to the "reservations" collection in MongoDB
public class Reservation {
    
    /**
     * Unique identifier for the reservation
     * Generated automatically by MongoDB when a new reservation is created
     */
    @Id
    private String id;
    
    /**
     * Reference to the member making the reservation
     * Links to the Member entity's id field
     * Used to identify who reserved the book and for notifications
     */
    private String memberID;
    
    /**
     * Reference to the book being reserved
     * Links to the Book entity's id field
     * Used to track which book is reserved and check availability
     */
    private String bookID;
    
    /**
     * Date when the reservation was made
     * Used for queue ordering (first-come, first-served) and reporting
     */
    private LocalDate reservationDate;
    
    /**
     * Current status of the reservation
     * 
     * Possible values:
     * - "PENDING": Reservation is active, waiting for book availability
     * - "APPROVED": Book is available, member has been notified
     * - "CANCELLED": Reservation was cancelled by member or librarian
     * - "FULFILLED": Member has borrowed the reserved book
     * 
     * Status determines what actions can be taken on the reservation
     */
    private String status; // PENDING, APPROVED, CANCELLED, FULFILLED
    
    /**
     * Date when the member was notified about book availability
     * Set when status changes from PENDING to APPROVED
     * Used to calculate if reservation has expired
     */
    private LocalDate notifiedDate;
    
    /**
     * Date when the reservation expires if not fulfilled
     * Calculated as notifiedDate + reservation hold period (usually 3-7 days)
     * After this date, reservation may be cancelled and offered to next member in queue
     */
    private LocalDate expiryDate;

    /**
     * Default constructor required by MongoDB for object deserialization
     * Spring Data MongoDB uses this constructor when retrieving documents from the database
     */
    public Reservation() {
    }

    // =============================================================================
    // GETTER AND SETTER METHODS
    // =============================================================================
    // These methods provide controlled access to the reservation's properties
    // Following JavaBean conventions for compatibility with Spring framework
    
    /**
     * Gets the unique identifier of the reservation
     * @return The reservation's MongoDB ObjectId as a string
     */
    public String getId() { return id; }
    
    /**
     * Sets the unique identifier of the reservation
     * @param id The reservation's MongoDB ObjectId as a string
     */
    public void setId(String id) { this.id = id; }
    
    /**
     * Gets the ID of the member who made the reservation
     * @return The member's ID (foreign key reference)
     */
    public String getMemberID() { return memberID; }
    
    /**
     * Sets the ID of the member who made the reservation
     * @param memberID The member's ID (foreign key reference)
     */
    public void setMemberID(String memberID) { this.memberID = memberID; }
    
    /**
     * Gets the ID of the reserved book
     * @return The book's ID (foreign key reference)
     */
    public String getBookID() { return bookID; }
    
    /**
     * Sets the ID of the reserved book
     * @param bookID The book's ID (foreign key reference)
     */
    public void setBookID(String bookID) { this.bookID = bookID; }
    
    /**
     * Gets the date when the reservation was made
     * @return The reservation date
     */
    public LocalDate getReservationDate() { return reservationDate; }
    
    /**
     * Sets the date when the reservation was made
     * @param reservationDate The reservation date
     */
    public void setReservationDate(LocalDate reservationDate) { this.reservationDate = reservationDate; }
    
    /**
     * Gets the current status of the reservation
     * @return The status (PENDING, APPROVED, CANCELLED, or FULFILLED)
     */
    public String getStatus() { return status; }
    
    /**
     * Sets the current status of the reservation
     * @param status The status (PENDING, APPROVED, CANCELLED, or FULFILLED)
     */
    public void setStatus(String status) { this.status = status; }
    
    /**
     * Gets the date when member was notified about availability
     * @return The notification date (null if not yet notified)
     */
    public LocalDate getNotifiedDate() { return notifiedDate; }
    
    /**
     * Sets the date when member was notified about availability
     * @param notifiedDate The notification date
     */
    public void setNotifiedDate(LocalDate notifiedDate) { this.notifiedDate = notifiedDate; }
    
    /**
     * Gets the expiry date of the reservation
     * @return The expiry date (null if no expiry set)
     */
    public LocalDate getExpiryDate() { return expiryDate; }
    
    /**
     * Sets the expiry date of the reservation
     * @param expiryDate The expiry date
     */
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
}
