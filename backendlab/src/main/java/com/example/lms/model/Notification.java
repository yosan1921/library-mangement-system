package com.example.lms.model;

// Spring Data MongoDB annotations for document mapping
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
// Java time API for precise timestamp handling
import java.time.LocalDateTime;

/**
 * Notification Entity - Represents system notifications sent to library members
 * 
 * This class manages all types of notifications sent to library members through
 * various channels (email, SMS, or both). It provides a comprehensive notification
 * system for keeping members informed about library activities and deadlines.
 * 
 * Notification Types:
 * - EMAIL: Email notifications only
 * - SMS: Text message notifications only  
 * - BOTH: Send via both email and SMS channels
 * 
 * Notification Categories:
 * - DUE_DATE_REMINDER: Reminds members of upcoming due dates
 * - OVERDUE_REMINDER: Notifies members of overdue books
 * - RESERVATION_READY: Alerts when reserved books become available
 * - FINE_NOTICE: Informs members about fines and payment requirements
 * - GENERAL: Administrative announcements and general information
 * 
 * Status Workflow:
 * 1. PENDING: Notification created but not yet sent
 * 2. SENT: Notification successfully delivered
 * 3. FAILED: Notification delivery failed (with error details)
 * 
 * Key Features:
 * - Multi-channel delivery (email and SMS)
 * - Delivery status tracking with error handling
 * - Links to related entities (borrow records, reservations, fines)
 * - Duplicate member information for notification reliability
 * - Audit trail with creation and delivery timestamps
 * 
 * Related Entities:
 * - Member: The recipient of the notification (memberId reference)
 * - BorrowRecord, Reservation, Fine: Related entities (relatedEntityId reference)
 * 
 * MongoDB Collection: "notifications"
 */
@Document(collection = "notifications") // Maps this class to the "notifications" collection in MongoDB
public class Notification {
    
    /**
     * Unique identifier for the notification
     * Generated automatically by MongoDB when a new notification is created
     */
    @Id
    private String id;
    
    /**
     * Reference to the member receiving the notification
     * Links to the Member entity's id field
     * Used for targeting specific members and tracking notification history
     */
    private String memberId;
    
    /**
     * Member's name (cached for notification reliability)
     * Stored separately to ensure notifications can be sent even if member data changes
     * Used in notification content personalization
     */
    private String memberName;
    
    /**
     * Member's email address (cached for notification delivery)
     * Stored separately to ensure email delivery even if member updates their email
     * Used for email notification delivery
     */
    private String memberEmail;
    
    /**
     * Member's contact number (cached for SMS delivery)
     * Stored separately to ensure SMS delivery even if member updates their phone
     * Used for SMS notification delivery
     */
    private String memberContact;
    
    /**
     * Notification delivery type
     * 
     * Possible values:
     * - "EMAIL": Send notification via email only
     * - "SMS": Send notification via SMS only
     * - "BOTH": Send notification via both email and SMS
     * 
     * Determines which delivery channels to use for this notification
     */
    private String type; // EMAIL, SMS, BOTH
    
    /**
     * Category of the notification
     * 
     * Possible values:
     * - "DUE_DATE_REMINDER": Upcoming book due date reminders
     * - "OVERDUE_REMINDER": Overdue book notifications
     * - "RESERVATION_READY": Reserved book availability alerts
     * - "FINE_NOTICE": Fine payment notifications
     * - "GENERAL": Administrative announcements and general information
     * 
     * Used for notification filtering, reporting, and template selection
     */
    private String category; // DUE_DATE_REMINDER, OVERDUE_REMINDER, RESERVATION_READY, FINE_NOTICE, GENERAL
    
    /**
     * Subject line for the notification
     * Used as email subject and SMS preview text
     * Should be concise and descriptive of the notification content
     */
    private String subject;
    
    /**
     * Main content/body of the notification
     * Contains the detailed message to be sent to the member
     * May include personalized information like book titles, due dates, etc.
     */
    private String message;
    
    /**
     * Flag indicating if the notification has been sent
     * Legacy field maintained for backward compatibility
     * Use 'status' field for more detailed delivery tracking
     */
    private Boolean sent;
    
    /**
     * Timestamp when the notification was successfully sent
     * Null until the notification is actually delivered
     * Used for delivery confirmation and audit trails
     */
    private LocalDateTime sentAt;
    
    /**
     * Timestamp when the notification was created
     * Set automatically when notification is first created
     * Used for notification aging and cleanup processes
     */
    private LocalDateTime createdAt;
    
    /**
     * Current delivery status of the notification
     * 
     * Possible values:
     * - "PENDING": Notification created but not yet sent
     * - "SENT": Notification successfully delivered
     * - "FAILED": Notification delivery failed (check errorMessage for details)
     * 
     * Provides detailed tracking of notification delivery lifecycle
     */
    private String status; // PENDING, SENT, FAILED
    
    /**
     * Error message if notification delivery failed
     * Contains technical details about delivery failures
     * Used for troubleshooting and retry logic
     */
    private String errorMessage;
    
    /**
     * Reference to the entity that triggered this notification
     * Can link to borrowId, reservationId, fineId, etc.
     * Used for notification context and preventing duplicate notifications
     */
    private String relatedEntityId; // borrowId, reservationId, fineId, etc.
    
    /**
     * Default constructor for MongoDB deserialization
     * Initializes default values for new notifications:
     * - Sets sent flag to false
     * - Sets creation timestamp to current time
     * - Sets initial status to PENDING
     */
    public Notification() {
        this.sent = false;                    // Not sent initially
        this.createdAt = LocalDateTime.now(); // Set creation timestamp
        this.status = "PENDING";              // Initial status is pending
    }

    // =============================================================================
    // GETTER AND SETTER METHODS
    // =============================================================================
    // These methods provide controlled access to the notification's properties
    // Following JavaBean conventions for compatibility with Spring framework
    
    /**
     * Gets the unique identifier of the notification
     * @return The notification's MongoDB ObjectId as a string
     */
    public String getId() { return id; }
    
    /**
     * Sets the unique identifier of the notification
     * @param id The notification's MongoDB ObjectId as a string
     */
    public void setId(String id) { this.id = id; }
    
    /**
     * Gets the ID of the member receiving the notification
     * @return The member's ID (foreign key reference)
     */
    public String getMemberId() { return memberId; }
    
    /**
     * Sets the ID of the member receiving the notification
     * @param memberId The member's ID (foreign key reference)
     */
    public void setMemberId(String memberId) { this.memberId = memberId; }
    
    /**
     * Gets the cached member name
     * @return The member's name at time of notification creation
     */
    public String getMemberName() { return memberName; }
    
    /**
     * Sets the cached member name
     * @param memberName The member's name at time of notification creation
     */
    public void setMemberName(String memberName) { this.memberName = memberName; }
    
    /**
     * Gets the cached member email address
     * @return The member's email at time of notification creation
     */
    public String getMemberEmail() { return memberEmail; }
    
    /**
     * Sets the cached member email address
     * @param memberEmail The member's email at time of notification creation
     */
    public void setMemberEmail(String memberEmail) { this.memberEmail = memberEmail; }
    
    /**
     * Gets the cached member contact number
     * @return The member's phone number at time of notification creation
     */
    public String getMemberContact() { return memberContact; }
    
    /**
     * Sets the cached member contact number
     * @param memberContact The member's phone number at time of notification creation
     */
    public void setMemberContact(String memberContact) { this.memberContact = memberContact; }
    
    /**
     * Gets the notification delivery type
     * @return The delivery type (EMAIL, SMS, or BOTH)
     */
    public String getType() { return type; }
    
    /**
     * Sets the notification delivery type
     * @param type The delivery type (EMAIL, SMS, or BOTH)
     */
    public void setType(String type) { this.type = type; }
    
    /**
     * Gets the notification category
     * @return The category (DUE_DATE_REMINDER, OVERDUE_REMINDER, etc.)
     */
    public String getCategory() { return category; }
    
    /**
     * Sets the notification category
     * @param category The category (DUE_DATE_REMINDER, OVERDUE_REMINDER, etc.)
     */
    public void setCategory(String category) { this.category = category; }
    
    /**
     * Gets the notification subject
     * @return The subject line for email/SMS preview
     */
    public String getSubject() { return subject; }
    
    /**
     * Sets the notification subject
     * @param subject The subject line for email/SMS preview
     */
    public void setSubject(String subject) { this.subject = subject; }
    
    /**
     * Gets the notification message content
     * @return The main message body
     */
    public String getMessage() { return message; }
    
    /**
     * Sets the notification message content
     * @param message The main message body
     */
    public void setMessage(String message) { this.message = message; }
    
    /**
     * Gets the sent flag (legacy)
     * @return true if notification has been sent, false otherwise
     */
    public Boolean getSent() { return sent; }
    
    /**
     * Sets the sent flag (legacy)
     * @param sent true if notification has been sent, false otherwise
     */
    public void setSent(Boolean sent) { this.sent = sent; }
    
    /**
     * Gets the timestamp when notification was sent
     * @return The delivery timestamp (null if not yet sent)
     */
    public LocalDateTime getSentAt() { return sentAt; }
    
    /**
     * Sets the timestamp when notification was sent
     * @param sentAt The delivery timestamp
     */
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    
    /**
     * Gets the notification creation timestamp
     * @return The creation timestamp
     */
    public LocalDateTime getCreatedAt() { return createdAt; }
    
    /**
     * Sets the notification creation timestamp
     * @param createdAt The creation timestamp
     */
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    /**
     * Gets the current delivery status
     * @return The status (PENDING, SENT, or FAILED)
     */
    public String getStatus() { return status; }
    
    /**
     * Sets the current delivery status
     * @param status The status (PENDING, SENT, or FAILED)
     */
    public void setStatus(String status) { this.status = status; }
    
    /**
     * Gets the error message for failed deliveries
     * @return The error message (null if no error)
     */
    public String getErrorMessage() { return errorMessage; }
    
    /**
     * Sets the error message for failed deliveries
     * @param errorMessage The error message
     */
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    
    /**
     * Gets the ID of the related entity that triggered this notification
     * @return The related entity ID (borrowId, reservationId, fineId, etc.)
     */
    public String getRelatedEntityId() { return relatedEntityId; }
    
    /**
     * Sets the ID of the related entity that triggered this notification
     * @param relatedEntityId The related entity ID (borrowId, reservationId, fineId, etc.)
     */
    public void setRelatedEntityId(String relatedEntityId) { this.relatedEntityId = relatedEntityId; }
}
