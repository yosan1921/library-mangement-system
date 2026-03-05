package com.example.lms.model;

// Spring Data MongoDB annotations for document mapping
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
// Java time API for date handling (preferred over Date class)
import java.time.LocalDate;

/**
 * BorrowRecord Entity - Represents a book borrowing transaction
 * 
 * This class tracks the complete lifecycle of a book borrowing transaction,
 * from initial request through approval, issuance, and eventual return.
 * It serves as the core entity for managing book circulation in the library.
 * 
 * Workflow States:
 * 1. PENDING: Member has requested to borrow a book, awaiting librarian approval
 * 2. APPROVED: Librarian has approved the request, book is issued to member
 * 3. REJECTED: Librarian has rejected the borrowing request
 * 4. RETURNED: Member has returned the book, transaction is complete
 * 
 * Key Features:
 * - Links members to borrowed books via foreign key references
 * - Tracks important dates: issue, due, and actual return dates
 * - Automatically calculates overdue status for fine generation
 * - Supports approval workflow for controlled book distribution
 * 
 * Related Entities:
 * - Member: The person borrowing the book (memberID reference)
 * - Book: The book being borrowed (bookID reference)
 * - Fine: Generated when books are returned overdue
 * 
 * MongoDB Collection: "borrowRecords"
 */
@Document(collection = "borrowRecords") // Maps this class to the "borrowRecords" collection in MongoDB
public class BorrowRecord {
    
    /**
     * Unique identifier for the borrow record
     * Generated automatically by MongoDB when a new record is created
     */
    @Id
    private String id;
    
    /**
     * Reference to the member who is borrowing the book
     * Links to the Member entity's id field
     * Used to identify which member has borrowed which books
     */
    private String memberID;
    
    /**
     * Reference to the book being borrowed
     * Links to the Book entity's id field
     * Used to track which specific book is borrowed
     */
    private String bookID;
    
    /**
     * Date when the book was issued to the member
     * Set when the borrow request is approved and book is physically given to member
     * Used for calculating borrowing duration and generating reports
     */
    private LocalDate issueDate;
    
    /**
     * Date when the book is due to be returned
     * Calculated based on issue date + library's borrowing period (usually 14-30 days)
     * Used for overdue calculations and sending reminder notifications
     */
    private LocalDate dueDate;
    
    /**
     * Actual date when the book was returned by the member
     * Null until the book is actually returned
     * Used to calculate if the book was returned on time or overdue
     */
    private LocalDate returnDate;
    
    /**
     * Flag indicating if the book is currently overdue
     * Automatically calculated by comparing current date with due date
     * Used for generating overdue reports and calculating fines
     */
    private Boolean overdue;
    
    /**
     * Current status of the borrowing transaction
     * 
     * Possible values:
     * - "PENDING": Member has requested the book, awaiting librarian approval
     * - "APPROVED": Librarian approved the request, book is issued to member
     * - "REJECTED": Librarian rejected the borrowing request
     * - "RETURNED": Member has returned the book, transaction is complete
     * - "LOST": Book has been reported as lost by the member
     * - "DAMAGED": Book was returned in damaged condition
     * 
     * Status transitions:
     * PENDING → APPROVED (librarian approves) → RETURNED (member returns book)
     * PENDING → REJECTED (librarian rejects request)
     * APPROVED → LOST (member reports book as lost)
     * APPROVED → DAMAGED (book returned damaged)
     */
    private String status; // PENDING, APPROVED, REJECTED, RETURNED, LOST, DAMAGED
    
    /**
     * Condition of the book when returned
     * 
     * Possible values:
     * - "GOOD": Book returned in good condition
     * - "DAMAGED": Book returned with damage (torn pages, water damage, etc.)
     * - "LOST": Book was not returned and is considered lost
     * 
     * Used for determining if additional fines should be applied
     */
    private String bookCondition; // GOOD, DAMAGED, LOST
    
    /**
     * Notes about the book condition or return circumstances
     * Used to document any issues with the book or special circumstances
     */
    private String conditionNotes;

    /**
     * Default constructor required by MongoDB for object deserialization
     * Spring Data MongoDB uses this constructor when retrieving documents from the database
     */
    public BorrowRecord() {
    }

    // =============================================================================
    // GETTER AND SETTER METHODS
    // =============================================================================
    // These methods provide controlled access to the borrow record's properties
    // Following JavaBean conventions for compatibility with Spring framework
    
    /**
     * Gets the unique identifier of the borrow record
     * @return The record's MongoDB ObjectId as a string
     */
    public String getId() { return id; }
    
    /**
     * Sets the unique identifier of the borrow record
     * @param id The record's MongoDB ObjectId as a string
     */
    public void setId(String id) { this.id = id; }
    
    /**
     * Gets the ID of the member who borrowed the book
     * @return The member's ID (foreign key reference)
     */
    public String getMemberID() { return memberID; }
    
    /**
     * Sets the ID of the member who borrowed the book
     * @param memberID The member's ID (foreign key reference)
     */
    public void setMemberID(String memberID) { this.memberID = memberID; }
    
    /**
     * Gets the ID of the borrowed book
     * @return The book's ID (foreign key reference)
     */
    public String getBookID() { return bookID; }
    
    /**
     * Sets the ID of the borrowed book
     * @param bookID The book's ID (foreign key reference)
     */
    public void setBookID(String bookID) { this.bookID = bookID; }
    
    /**
     * Gets the date when the book was issued
     * @return The issue date
     */
    public LocalDate getIssueDate() { return issueDate; }
    
    /**
     * Sets the date when the book was issued
     * @param issueDate The issue date
     */
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    
    /**
     * Gets the date when the book is due for return
     * @return The due date
     */
    public LocalDate getDueDate() { return dueDate; }
    
    /**
     * Sets the date when the book is due for return
     * @param dueDate The due date
     */
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    
    /**
     * Gets the actual date when the book was returned
     * @return The return date (null if not yet returned)
     */
    public LocalDate getReturnDate() { return returnDate; }
    
    /**
     * Sets the actual date when the book was returned
     * @param returnDate The return date
     */
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }
    
    /**
     * Gets the overdue status of the borrowed book
     * @return true if the book is overdue, false otherwise
     */
    public Boolean getOverdue() { return overdue; }
    
    /**
     * Sets the overdue status of the borrowed book
     * @param overdue true if the book is overdue, false otherwise
     */
    public void setOverdue(Boolean overdue) { this.overdue = overdue; }
    
    /**
     * Gets the current status of the borrowing transaction
     * @return The status (PENDING, APPROVED, REJECTED, or RETURNED)
     */
    public String getStatus() { return status; }
    
    /**
     * Sets the current status of the borrowing transaction
     * @param status The status (PENDING, APPROVED, REJECTED, RETURNED, LOST, or DAMAGED)
     */
    public void setStatus(String status) { this.status = status; }
    
    /**
     * Gets the condition of the book when returned
     * @return The book condition (GOOD, DAMAGED, or LOST)
     */
    public String getBookCondition() { return bookCondition; }
    
    /**
     * Sets the condition of the book when returned
     * @param bookCondition The book condition (GOOD, DAMAGED, or LOST)
     */
    public void setBookCondition(String bookCondition) { this.bookCondition = bookCondition; }
    
    /**
     * Gets the notes about book condition or return circumstances
     * @return Condition notes
     */
    public String getConditionNotes() { return conditionNotes; }
    
    /**
     * Sets the notes about book condition or return circumstances
     * @param conditionNotes Condition notes
     */
    public void setConditionNotes(String conditionNotes) { this.conditionNotes = conditionNotes; }
}
