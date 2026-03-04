package com.example.lms.repository;

// Import the BorrowRecord model class
import com.example.lms.model.BorrowRecord;
// Spring Data MongoDB repository interface
import org.springframework.data.mongodb.repository.MongoRepository;
// Spring stereotype annotation for repository beans
import org.springframework.stereotype.Repository;
// Java collections class
import java.util.List;

/**
 * BorrowRecordRepository Interface - Data Access Layer for BorrowRecord entities
 * 
 * This repository interface provides database operations for BorrowRecord entities,
 * which track the complete lifecycle of book borrowing transactions. It extends
 * MongoRepository for basic CRUD operations and defines custom queries for
 * borrowing-specific business logic and reporting needs.
 * 
 * Inherited Operations (from MongoRepository):
 * - save(BorrowRecord record): Create or update a borrow record
 * - findById(String id): Find borrow record by ID
 * - findAll(): Retrieve all borrow records
 * - deleteById(String id): Delete borrow record by ID
 * - count(): Count total borrow records
 * - existsById(String id): Check if borrow record exists
 * 
 * Custom Query Methods:
 * - Member-based queries for borrowing history and current loans
 * - Book-based queries for circulation tracking
 * - Status-based filtering for workflow management
 * - Overdue detection for fine calculation and notifications
 * - Active loan tracking for return processing
 * 
 * Business Use Cases:
 * - Member borrowing history and current loans
 * - Book circulation statistics and availability
 * - Overdue book identification for fine processing
 * - Workflow management (pending approvals, active loans)
 * - Reporting and analytics on library usage
 * 
 * Related Entities:
 * - Member: Each record belongs to a specific member
 * - Book: Each record tracks a specific book borrowing
 * - Fine: Generated from overdue borrow records
 * - Notification: Triggered by borrow record status changes
 */
@Repository // Marks this interface as a Spring Data repository component
public interface BorrowRecordRepository extends MongoRepository<BorrowRecord, String> {
    
    /**
     * Finds all borrow records for a specific member
     * 
     * This method retrieves the complete borrowing history for a member,
     * including past and current transactions. Used for member account
     * management, borrowing history display, and limit enforcement.
     * 
     * MongoDB Query: { "memberID": "memberID" }
     * 
     * @param memberID The ID of the member whose borrow records to retrieve
     * @return List of all borrow records for the specified member
     */
    List<BorrowRecord> findByMemberID(String memberID);
    
    /**
     * Finds all borrow records for a specific book
     * 
     * This method retrieves the circulation history for a book, showing
     * all past and current borrowing transactions. Used for book popularity
     * analysis, circulation statistics, and availability tracking.
     * 
     * MongoDB Query: { "bookID": "bookID" }
     * 
     * @param bookID The ID of the book whose borrow records to retrieve
     * @return List of all borrow records for the specified book
     */
    List<BorrowRecord> findByBookID(String bookID);
    
    /**
     * Finds all currently active borrow records (books not yet returned)
     * 
     * This method identifies all books that are currently borrowed by finding
     * records where the return date is null. Used for tracking active loans,
     * calculating current library circulation, and identifying overdue books.
     * 
     * MongoDB Query: { "returnDate": null }
     * 
     * @return List of borrow records for books that haven't been returned yet
     */
    List<BorrowRecord> findByReturnDateIsNull();
    
    /**
     * Finds borrow records by overdue status
     * 
     * This method filters borrow records based on their overdue flag.
     * Used for identifying overdue books for fine calculation, sending
     * reminder notifications, and generating overdue reports.
     * 
     * MongoDB Query: { "overdue": overdue }
     * 
     * @param overdue true to find overdue records, false for non-overdue records
     * @return List of borrow records matching the specified overdue status
     */
    List<BorrowRecord> findByOverdue(Boolean overdue);
    
    /**
     * Finds borrow records by transaction status
     * 
     * This method filters records by their current status in the borrowing
     * workflow. Used for workflow management, approval processes, and
     * status-specific reporting and operations.
     * 
     * MongoDB Query: { "status": "status" }
     * 
     * Common status values:
     * - "PENDING": Awaiting librarian approval
     * - "APPROVED": Book issued to member
     * - "REJECTED": Request denied by librarian
     * - "RETURNED": Book returned and transaction complete
     * 
     * @param status The status to filter by (PENDING, APPROVED, REJECTED, RETURNED)
     * @return List of borrow records with the specified status
     */
    List<BorrowRecord> findByStatus(String status);
}
