package com.example.lms.repository;

// Import the Payment model class
import com.example.lms.model.Payment;
// Spring Data MongoDB repository interface
import org.springframework.data.mongodb.repository.MongoRepository;
// Spring stereotype annotation for repository beans
import org.springframework.stereotype.Repository;
// Java collections class
import java.util.List;

/**
 * PaymentRepository Interface - Data Access Layer for Payment entities
 * 
 * This repository interface provides database operations for Payment entities,
 * which track financial transactions for library fine payments. It extends
 * MongoRepository for basic CRUD operations and defines custom queries for
 * payment tracking, financial reporting, and audit trail management.
 * 
 * Inherited Operations (from MongoRepository):
 * - save(Payment payment): Create or update a payment record
 * - findById(String id): Find payment by ID
 * - findAll(): Retrieve all payment records
 * - deleteById(String id): Delete payment record
 * - count(): Count total payment records
 * - existsById(String id): Check if payment exists
 * 
 * Custom Query Methods:
 * - Member-based queries for personal payment history
 * - Fine-based queries for payment tracking against specific fines
 * 
 * Business Use Cases:
 * - Member payment history and transaction records
 * - Fine payment tracking and balance calculations
 * - Financial reporting and revenue analysis
 * - Audit trails for accounting and compliance
 * - Payment method analysis and preferences
 * 
 * Related Entities:
 * - Member: Each payment is made by a specific member
 * - Fine: Each payment is applied to a specific fine
 */
@Repository // Marks this interface as a Spring Data repository component
public interface PaymentRepository extends MongoRepository<Payment, String> {
    
    /**
     * Finds all payments made by a specific member
     * 
     * This method retrieves the complete payment history for a member,
     * showing all fine payments they have made. Used for member account
     * management, payment history display, and financial tracking.
     * 
     * MongoDB Query: { "memberID": "memberID" }
     * 
     * @param memberID The ID of the member whose payments to retrieve
     * @return List of all payments made by the specified member
     */
    List<Payment> findByMemberID(String memberID);
    
    /**
     * Finds all payments applied to a specific fine
     * 
     * This method retrieves all payment transactions that have been applied
     * to a particular fine. Used for tracking partial payments, calculating
     * remaining balances, and providing detailed payment breakdowns.
     * 
     * MongoDB Query: { "fineID": "fineID" }
     * 
     * @param fineID The ID of the fine whose payments to retrieve
     * @return List of all payments applied to the specified fine
     */
    List<Payment> findByFineID(String fineID);
}
