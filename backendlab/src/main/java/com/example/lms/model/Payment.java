package com.example.lms.model;

// Spring Data MongoDB annotations for document mapping
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
// Java time API for date handling
import java.time.LocalDate;

/**
 * Payment Entity - Represents a payment transaction for library fines
 * 
 * This class tracks payments made by members to settle their library fines.
 * It provides a complete audit trail of all financial transactions in the system,
 * supporting multiple payment methods and maintaining detailed records for accounting.
 * 
 * Key Features:
 * - Links payments to specific fines and members
 * - Supports multiple payment methods (cash, card, online)
 * - Maintains payment date for financial reporting
 * - Includes notes field for additional payment details
 * - Enables partial payment tracking when combined with Fine entity
 * 
 * Payment Methods:
 * - CASH: Physical cash payment at library counter
 * - CARD: Credit/debit card payment (in-person or online)
 * - ONLINE: Digital payment through web portal
 * 
 * Related Entities:
 * - Fine: The fine being paid (fineID reference)
 * - Member: The person making the payment (memberID reference)
 * 
 * MongoDB Collection: "payments"
 */
@Document(collection = "payments") // Maps this class to the "payments" collection in MongoDB
public class Payment {
    
    /**
     * Unique identifier for the payment record
     * Generated automatically by MongoDB when a new payment is recorded
     */
    @Id
    private String id;
    
    /**
     * Reference to the fine being paid
     * Links to the Fine entity's id field
     * Used to associate payments with specific fines for accounting
     */
    private String fineID;
    
    /**
     * Reference to the member making the payment
     * Links to the Member entity's id field
     * Used for member payment history and verification
     */
    private String memberID;
    
    /**
     * Amount paid in this transaction
     * Supports partial payments - may be less than the total fine amount
     * Used for calculating remaining balance on fines
     */
    private Double amount;
    
    /**
     * Date when the payment was made
     * Used for financial reporting and payment history tracking
     */
    private LocalDate paymentDate;
    
    /**
     * Method used for payment
     * 
     * Possible values:
     * - "CASH": Physical cash payment at library counter
     * - "CARD": Credit/debit card payment (in-person or online)
     * - "ONLINE": Digital payment through web portal or mobile app
     * 
     * Used for financial reconciliation and payment method analysis
     */
    private String paymentMethod; // CASH, CARD, ONLINE
    
    /**
     * Additional notes about the payment
     * Can include transaction IDs, receipt numbers, or special circumstances
     * Useful for payment verification and customer service
     */
    private String notes;

    /**
     * Default constructor required by MongoDB for object deserialization
     * Spring Data MongoDB uses this constructor when retrieving documents from the database
     */
    public Payment() {
    }

    // =============================================================================
    // GETTER AND SETTER METHODS
    // =============================================================================
    // These methods provide controlled access to the payment's properties
    // Following JavaBean conventions for compatibility with Spring framework
    
    /**
     * Gets the unique identifier of the payment
     * @return The payment's MongoDB ObjectId as a string
     */
    public String getId() { return id; }
    
    /**
     * Sets the unique identifier of the payment
     * @param id The payment's MongoDB ObjectId as a string
     */
    public void setId(String id) { this.id = id; }
    
    /**
     * Gets the ID of the fine being paid
     * @return The fine's ID (foreign key reference)
     */
    public String getFineID() { return fineID; }
    
    /**
     * Sets the ID of the fine being paid
     * @param fineID The fine's ID (foreign key reference)
     */
    public void setFineID(String fineID) { this.fineID = fineID; }
    
    /**
     * Gets the ID of the member making the payment
     * @return The member's ID (foreign key reference)
     */
    public String getMemberID() { return memberID; }
    
    /**
     * Sets the ID of the member making the payment
     * @param memberID The member's ID (foreign key reference)
     */
    public void setMemberID(String memberID) { this.memberID = memberID; }
    
    /**
     * Gets the payment amount
     * @return The amount paid in this transaction
     */
    public Double getAmount() { return amount; }
    
    /**
     * Sets the payment amount
     * @param amount The amount paid in this transaction
     */
    public void setAmount(Double amount) { this.amount = amount; }
    
    /**
     * Gets the payment date
     * @return The date when payment was made
     */
    public LocalDate getPaymentDate() { return paymentDate; }
    
    /**
     * Sets the payment date
     * @param paymentDate The date when payment was made
     */
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }
    
    /**
     * Gets the payment method
     * @return The method used for payment (CASH, CARD, or ONLINE)
     */
    public String getPaymentMethod() { return paymentMethod; }
    
    /**
     * Sets the payment method
     * @param paymentMethod The method used for payment (CASH, CARD, or ONLINE)
     */
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    /**
     * Gets additional notes about the payment
     * @return Payment notes or additional details
     */
    public String getNotes() { return notes; }
    
    /**
     * Sets additional notes about the payment
     * @param notes Payment notes or additional details
     */
    public void setNotes(String notes) { this.notes = notes; }
}
