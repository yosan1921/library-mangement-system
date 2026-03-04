package com.example.lms.model;

// Spring Data MongoDB annotations for document mapping
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
// Java time API for date handling
import java.time.LocalDate;

/**
 * Fine Entity - Represents monetary penalties for library violations
 * 
 * This class manages financial penalties imposed on library members for various violations,
 * primarily overdue book returns. It supports partial payments and tracks the complete
 * payment lifecycle from issuance to full settlement.
 * 
 * Common Fine Reasons:
 * - Overdue books: Daily charges for late returns
 * - Lost books: Replacement cost charges
 * - Damaged books: Repair or replacement costs
 * - Administrative fees: Processing charges for special circumstances
 * 
 * Payment Status Workflow:
 * 1. UNPAID: Fine issued but no payment received
 * 2. PARTIALLY_PAID: Some payment received but balance remains
 * 3. PAID: Full fine amount has been paid
 * 4. WAIVED: Fine forgiven by librarian/admin (special circumstances)
 * 
 * Key Features:
 * - Supports partial payments with running balance calculation
 * - Links to specific borrow records for audit trails
 * - Tracks payment dates for financial reporting
 * - Automatic status updates based on payment amounts
 * - Integration with payment processing system
 * 
 * Related Entities:
 * - Member: The person who owes the fine (memberID reference)
 * - BorrowRecord: The transaction that caused the fine (borrowRecordID reference)
 * - Payment: Individual payment transactions against this fine
 * 
 * MongoDB Collection: "fines"
 */
@Document(collection = "fines") // Maps this class to the "fines" collection in MongoDB
public class Fine {
    
    /**
     * Unique identifier for the fine
     * Generated automatically by MongoDB when a new fine is created
     */
    @Id
    private String id;
    
    /**
     * Reference to the member who owes the fine
     * Links to the Member entity's id field
     * Used for member fine history and account management
     */
    private String memberID;
    
    /**
     * Reference to the borrow record that caused the fine
     * Links to the BorrowRecord entity's id field
     * Provides audit trail linking fines to specific transactions
     */
    private String borrowRecordID;
    
    /**
     * Total amount of the fine
     * Original fine amount before any payments
     * Used as baseline for calculating remaining balance
     */
    private Double amount;
    
    /**
     * Total amount paid towards this fine
     * Sum of all payments made against this fine
     * Used to calculate remaining balance and payment status
     */
    private Double amountPaid;
    
    /**
     * Reason for the fine
     * Describes why the fine was imposed
     * 
     * Common values:
     * - "Overdue return - X days late"
     * - "Lost book - replacement cost"
     * - "Damaged book - repair cost"
     * - "Administrative fee"
     */
    private String reason;
    
    /**
     * Date when the fine was issued
     * Used for fine aging reports and payment deadline calculations
     */
    private LocalDate issueDate;
    
    /**
     * Date when the fine was fully paid
     * Null until the fine is completely settled
     * Used for payment completion tracking and reporting
     */
    private LocalDate paidDate;
    
    /**
     * Current payment status of the fine
     * 
     * Possible values:
     * - "UNPAID": No payments received, full amount due
     * - "PARTIALLY_PAID": Some payments received, balance remains
     * - "PAID": Fine fully paid, no balance due
     * - "WAIVED": Fine forgiven by staff, no payment required
     * 
     * Status automatically updates based on payment amounts
     */
    private String status; // UNPAID, PARTIALLY_PAID, PAID, WAIVED

    /**
     * Default constructor required by MongoDB for object deserialization
     * Spring Data MongoDB uses this constructor when retrieving documents from the database
     */
    public Fine() {
    }

    // =============================================================================
    // GETTER AND SETTER METHODS
    // =============================================================================
    // These methods provide controlled access to the fine's properties
    // Following JavaBean conventions for compatibility with Spring framework
    
    /**
     * Gets the unique identifier of the fine
     * @return The fine's MongoDB ObjectId as a string
     */
    public String getId() { return id; }
    
    /**
     * Sets the unique identifier of the fine
     * @param id The fine's MongoDB ObjectId as a string
     */
    public void setId(String id) { this.id = id; }
    
    /**
     * Gets the ID of the member who owes the fine
     * @return The member's ID (foreign key reference)
     */
    public String getMemberID() { return memberID; }
    
    /**
     * Sets the ID of the member who owes the fine
     * @param memberID The member's ID (foreign key reference)
     */
    public void setMemberID(String memberID) { this.memberID = memberID; }
    
    /**
     * Gets the ID of the borrow record that caused the fine
     * @return The borrow record's ID (foreign key reference)
     */
    public String getBorrowRecordID() { return borrowRecordID; }
    
    /**
     * Sets the ID of the borrow record that caused the fine
     * @param borrowRecordID The borrow record's ID (foreign key reference)
     */
    public void setBorrowRecordID(String borrowRecordID) { this.borrowRecordID = borrowRecordID; }
    
    /**
     * Gets the total fine amount
     * @return The original fine amount
     */
    public Double getAmount() { return amount; }
    
    /**
     * Sets the total fine amount
     * @param amount The original fine amount
     */
    public void setAmount(Double amount) { this.amount = amount; }
    
    /**
     * Gets the total amount paid towards this fine
     * @return The sum of all payments made
     */
    public Double getAmountPaid() { return amountPaid; }
    
    /**
     * Sets the total amount paid towards this fine
     * @param amountPaid The sum of all payments made
     */
    public void setAmountPaid(Double amountPaid) { this.amountPaid = amountPaid; }
    
    /**
     * Gets the reason for the fine
     * @return Description of why the fine was imposed
     */
    public String getReason() { return reason; }
    
    /**
     * Sets the reason for the fine
     * @param reason Description of why the fine was imposed
     */
    public void setReason(String reason) { this.reason = reason; }
    
    /**
     * Gets the date when the fine was issued
     * @return The fine issue date
     */
    public LocalDate getIssueDate() { return issueDate; }
    
    /**
     * Sets the date when the fine was issued
     * @param issueDate The fine issue date
     */
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    
    /**
     * Gets the date when the fine was fully paid
     * @return The payment completion date (null if not fully paid)
     */
    public LocalDate getPaidDate() { return paidDate; }
    
    /**
     * Sets the date when the fine was fully paid
     * @param paidDate The payment completion date
     */
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }
    
    /**
     * Gets the current payment status
     * @return The status (UNPAID, PARTIALLY_PAID, PAID, or WAIVED)
     */
    public String getStatus() { return status; }
    
    /**
     * Sets the current payment status
     * @param status The status (UNPAID, PARTIALLY_PAID, PAID, or WAIVED)
     */
    public void setStatus(String status) { this.status = status; }
    
    /**
     * Calculates the remaining amount due on this fine
     * 
     * This is a computed property that calculates the outstanding balance
     * by subtracting total payments from the original fine amount.
     * 
     * @return The remaining balance due (0.0 if fully paid or overpaid)
     */
    public Double getAmountDue() {
        // If no payments have been made, return the full amount
        if (amountPaid == null) return amount;
        
        // Calculate remaining balance (amount - payments made)
        return amount - amountPaid;
    }
}
