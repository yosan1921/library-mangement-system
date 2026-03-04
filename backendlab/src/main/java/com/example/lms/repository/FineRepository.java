package com.example.lms.repository;

// Import the Fine model class
import com.example.lms.model.Fine;
// Spring Data MongoDB repository interface
import org.springframework.data.mongodb.repository.MongoRepository;
// Spring stereotype annotation for repository beans
import org.springframework.stereotype.Repository;
// Java collections class
import java.util.List;

/**
 * FineRepository Interface - Data Access Layer for Fine entities
 * 
 * This repository interface provides database operations for Fine entities,
 * which represent monetary penalties for library violations. It extends
 * MongoRepository for basic CRUD operations and defines custom queries for
 * fine management, payment tracking, and financial reporting.
 * 
 * Inherited Operations (from MongoRepository):
 * - save(Fine fine): Create or update a fine
 * - findById(String id): Find fine by ID
 * - findAll(): Retrieve all fines
 * - deleteById(String id): Delete fine by ID
 * - count(): Count total fines
 * - existsById(String id): Check if fine exists
 * 
 * Custom Query Methods:
 * - Member-based queries for personal fine management
 * - Status-based filtering for payment tracking
 * - Borrow record linkage for audit trails
 * 
 * Business Use Cases:
 * - Member fine history and outstanding balances
 * - Payment status tracking and collections
 * - Financial reporting and revenue analysis
 * - Audit trails linking fines to specific transactions
 * - Automated fine calculation and processing
 * 
 * Related Entities:
 * - Member: Each fine is owed by a specific member
 * - BorrowRecord: Fines are generated from specific borrow transactions
 * - Payment: Individual payments made against fines
 * - Notification: Fine notices sent to members
 */
@Repository // Marks this interface as a Spring Data repository component
public interface FineRepository extends MongoRepository<Fine, String> {
    
    /**
     * Finds all fines for a specific member
     * 
     * This method retrieves all fines owed by a member, including paid,
     * unpaid, and partially paid fines. Used for member account management,
     * fine history display, and outstanding balance calculations.
     * 
     * MongoDB Query: { "memberID": "memberID" }
     * 
     * @param memberID The ID of the member whose fines to retrieve
     * @return List of all fines for the specified member
     */
    List<Fine> findByMemberID(String memberID);
    
    /**
     * Finds fines by their payment status
     * 
     * This method filters fines based on their current payment status.
     * Used for collections management, payment tracking, and financial
     * reporting on outstanding and settled fines.
     * 
     * MongoDB Query: { "status": "status" }
     * 
     * Common status values:
     * - "UNPAID": Fine issued but no payment received
     * - "PARTIALLY_PAID": Some payment received but balance remains
     * - "PAID": Fine fully paid, no balance due
     * - "WAIVED": Fine forgiven by staff, no payment required
     * 
     * @param status The payment status to filter by (UNPAID, PARTIALLY_PAID, PAID, WAIVED)
     * @return List of fines with the specified payment status
     */
    List<Fine> findByStatus(String status);
    
    /**
     * Finds fines associated with a specific borrow record
     * 
     * This method retrieves fines that were generated from a specific
     * borrowing transaction. Used for audit trails, linking fines to
     * their originating transactions, and transaction-specific reporting.
     * 
     * MongoDB Query: { "borrowRecordID": "borrowRecordID" }
     * 
     * @param borrowRecordID The ID of the borrow record that generated the fine
     * @return List of fines associated with the specified borrow record
     */
    List<Fine> findByBorrowRecordID(String borrowRecordID);
}
