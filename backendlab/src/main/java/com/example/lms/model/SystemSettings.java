package com.example.lms.model;

// Spring Data MongoDB annotations for document mapping
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
// Java time API for timestamp handling
import java.time.LocalDateTime;

/**
 * SystemSettings Entity - Represents configurable system parameters
 * 
 * This class stores all configurable settings for the Library Management System,
 * allowing administrators to customize library policies, notification preferences,
 * and system behavior without code changes. It provides a centralized configuration
 * management system for the entire LMS.
 * 
 * Configuration Categories:
 * 1. Library Policies: Borrowing rules, fines, and operational parameters
 * 2. Notification Settings: Email and SMS configuration and preferences
 * 3. System Information: Library contact details and identification
 * 4. Audit Information: Change tracking and administrative accountability
 * 
 * Key Features:
 * - Runtime configuration changes without system restart
 * - Default values for new installations
 * - Audit trail for configuration changes
 * - Support for multiple notification channels
 * - Flexible policy management
 * 
 * Usage Pattern:
 * - Typically only one SystemSettings document exists in the database
 * - Settings are loaded at application startup and cached for performance
 * - Changes are applied immediately and logged for audit purposes
 * 
 * Related Entities:
 * - All entities: System settings affect behavior across the entire system
 * - Admin: Only admins can modify system settings
 * 
 * MongoDB Collection: "systemSettings"
 */
@Document(collection = "systemSettings") // Maps this class to the "systemSettings" collection in MongoDB
public class SystemSettings {
    
    /**
     * Unique identifier for the system settings document
     * Typically only one settings document exists in the system
     */
    @Id
    private String id;
    
    // =============================================================================
    // LIBRARY POLICY SETTINGS
    // =============================================================================
    // These settings control the core operational rules of the library
    
    /**
     * Maximum number of books a member can borrow simultaneously
     * Controls library resource allocation and prevents hoarding
     * Default: 5 books per member
     */
    private Integer maxBooksPerMember;
    
    /**
     * Standard borrowing period in days
     * Determines how long members can keep borrowed books
     * Default: 14 days (2 weeks)
     */
    private Integer borrowDurationDays;
    
    /**
     * Fine amount charged per day for overdue books
     * Used for calculating penalties when books are returned late
     * Default: $1.00 per day
     */
    private Double finePerDay;
    
    /**
     * Fine amount charged for damaged books
     * Used when a book is returned in damaged condition
     * Default: $10.00 per damaged book
     */
    private Double damagedBookFine;
    
    /**
     * Fine amount charged for lost books
     * Used when a member reports a book as lost or fails to return it
     * Default: $25.00 per lost book (replacement cost)
     */
    private Double lostBookFine;
    
    /**
     * Maximum number of times a book can be renewed
     * Allows members to extend borrowing period if no reservations exist
     * Default: 2 renewals maximum
     */
    private Integer maxRenewals;
    
    /**
     * Number of days a reservation remains valid after notification
     * After this period, reservation may be cancelled and offered to next member
     * Default: 3 days hold period
     */
    private Integer reservationExpiryDays;
    
    // =============================================================================
    // NOTIFICATION SYSTEM SETTINGS
    // =============================================================================
    // These settings control how and when the system sends notifications
    
    /**
     * Global toggle for email notification functionality
     * When false, no email notifications will be sent regardless of other settings
     * Default: false (disabled until configured)
     */
    private Boolean emailNotificationsEnabled;
    
    /**
     * Global toggle for SMS notification functionality
     * When false, no SMS notifications will be sent regardless of other settings
     * Default: false (disabled until configured)
     */
    private Boolean smsNotificationsEnabled;
    
    /**
     * Number of days before due date to send reminder notifications
     * Helps members avoid overdue fines by reminding them in advance
     * Default: 2 days before due date
     */
    private Integer dueDateReminderDays;
    
    /**
     * Number of days after due date to send overdue notifications
     * Frequency of overdue reminders to encourage prompt returns
     * Default: 1 day after due date
     */
    private Integer overdueReminderDays;
    
    // =============================================================================
    // EMAIL CONFIGURATION SETTINGS
    // =============================================================================
    // SMTP server settings for email notification delivery
    
    /**
     * SMTP server hostname for email delivery
     * Example: smtp.gmail.com, smtp.outlook.com
     */
    private String emailHost;
    
    /**
     * SMTP server port number
     * Common values: 587 (TLS), 465 (SSL), 25 (unsecured)
     */
    private Integer emailPort;
    
    /**
     * Username for SMTP server authentication
     * Usually the email address or account name
     */
    private String emailUsername;
    
    /**
     * Password for SMTP server authentication
     * Should be encrypted or use app-specific passwords for security
     */
    private String emailPassword;
    
    // =============================================================================
    // SMS CONFIGURATION SETTINGS
    // =============================================================================
    // SMS service provider settings for text message delivery
    
    /**
     * SMS service provider name
     * Example: "Twilio", "AWS SNS", "Nexmo"
     */
    private String smsProvider;
    
    /**
     * API key for SMS service authentication
     * Provider-specific authentication token
     */
    private String smsApiKey;
    
    /**
     * Username for SMS service (provider-specific)
     * For Twilio: Account SID
     * For other providers: service username
     */
    private String smsUsername;  // For Twilio Account SID or other provider username
    
    /**
     * Phone number used as sender for SMS messages
     * Must be registered with SMS provider and verified
     */
    private String smsFromNumber; // SMS sender phone number
    
    // =============================================================================
    // LIBRARY INFORMATION SETTINGS
    // =============================================================================
    // Basic library contact and identification information
    
    /**
     * Official name of the library
     * Used in notifications, reports, and system displays
     */
    private String libraryName;
    
    /**
     * Official email address of the library
     * Used for member communications and system notifications
     */
    private String libraryEmail;
    
    /**
     * Main phone number of the library
     * Used for member contact and emergency communications
     */
    private String libraryPhone;
    
    /**
     * Physical address of the library
     * Used for member information and official correspondence
     */
    private String libraryAddress;
    
    // =============================================================================
    // AUDIT AND METADATA SETTINGS
    // =============================================================================
    // Change tracking and administrative accountability
    
    /**
     * Timestamp of the last settings update
     * Used for change tracking and audit trails
     */
    private LocalDateTime lastUpdated;
    
    /**
     * ID or username of the admin who last updated settings
     * Provides accountability for configuration changes
     */
    private String updatedBy;

    /**
     * Default constructor for MongoDB deserialization
     * Initializes all settings with sensible default values for new installations
     * These defaults provide a working configuration out of the box
     */
    public SystemSettings() {
        // Library Policy Defaults - Conservative settings for new libraries
        this.maxBooksPerMember = 5;           // Reasonable limit for most libraries
        this.borrowDurationDays = 14;         // Standard 2-week borrowing period
        this.finePerDay = 1.0;               // $1 per day fine (adjust for local currency)
        this.damagedBookFine = 10.0;         // $10 fine for damaged books
        this.lostBookFine = 25.0;            // $25 fine for lost books (replacement cost)
        this.maxRenewals = 2;                // Allow 2 renewals (up to 6 weeks total)
        this.reservationExpiryDays = 3;      // 3-day hold period for reservations
        
        // Notification Defaults - Disabled until properly configured
        this.emailNotificationsEnabled = false;  // Require explicit email setup
        this.smsNotificationsEnabled = false;    // Require explicit SMS setup
        this.dueDateReminderDays = 2;            // Remind 2 days before due date
        this.overdueReminderDays = 1;            // Remind 1 day after overdue
    }

    // =============================================================================
    // GETTER AND SETTER METHODS
    // =============================================================================
    // These methods provide controlled access to all system settings
    // Following JavaBean conventions for compatibility with Spring framework
    
    /**
     * Gets the unique identifier of the system settings
     * @return The settings document's MongoDB ObjectId as a string
     */
    public String getId() { return id; }
    
    /**
     * Sets the unique identifier of the system settings
     * @param id The settings document's MongoDB ObjectId as a string
     */
    public void setId(String id) { this.id = id; }
    
    // Library Policy Getters and Setters
    
    /**
     * Gets the maximum books per member limit
     * @return Maximum number of books a member can borrow simultaneously
     */
    public Integer getMaxBooksPerMember() { return maxBooksPerMember; }
    
    /**
     * Sets the maximum books per member limit
     * @param maxBooksPerMember Maximum number of books a member can borrow simultaneously
     */
    public void setMaxBooksPerMember(Integer maxBooksPerMember) { this.maxBooksPerMember = maxBooksPerMember; }
    
    /**
     * Gets the standard borrowing duration
     * @return Number of days books can be borrowed
     */
    public Integer getBorrowDurationDays() { return borrowDurationDays; }
    
    /**
     * Sets the standard borrowing duration
     * @param borrowDurationDays Number of days books can be borrowed
     */
    public void setBorrowDurationDays(Integer borrowDurationDays) { this.borrowDurationDays = borrowDurationDays; }
    
    /**
     * Gets the daily fine amount for overdue books
     * @return Fine amount per day
     */
    public Double getFinePerDay() { return finePerDay; }
    
    /**
     * Sets the daily fine amount for overdue books
     * @param finePerDay Fine amount per day
     */
    public void setFinePerDay(Double finePerDay) { this.finePerDay = finePerDay; }
    
    /**
     * Gets the fine amount for damaged books
     * @return Fine amount for damaged books
     */
    public Double getDamagedBookFine() { return damagedBookFine; }
    
    /**
     * Sets the fine amount for damaged books
     * @param damagedBookFine Fine amount for damaged books
     */
    public void setDamagedBookFine(Double damagedBookFine) { this.damagedBookFine = damagedBookFine; }
    
    /**
     * Gets the fine amount for lost books
     * @return Fine amount for lost books
     */
    public Double getLostBookFine() { return lostBookFine; }
    
    /**
     * Sets the fine amount for lost books
     * @param lostBookFine Fine amount for lost books
     */
    public void setLostBookFine(Double lostBookFine) { this.lostBookFine = lostBookFine; }
    
    /**
     * Gets the maximum number of renewals allowed
     * @return Maximum renewals per book
     */
    public Integer getMaxRenewals() { return maxRenewals; }
    
    /**
     * Sets the maximum number of renewals allowed
     * @param maxRenewals Maximum renewals per book
     */
    public void setMaxRenewals(Integer maxRenewals) { this.maxRenewals = maxRenewals; }
    
    /**
     * Gets the reservation expiry period
     * @return Number of days reservations remain valid after notification
     */
    public Integer getReservationExpiryDays() { return reservationExpiryDays; }
    
    /**
     * Sets the reservation expiry period
     * @param reservationExpiryDays Number of days reservations remain valid after notification
     */
    public void setReservationExpiryDays(Integer reservationExpiryDays) { this.reservationExpiryDays = reservationExpiryDays; }
    
    // Notification Settings Getters and Setters
    
    /**
     * Gets the email notifications enabled status
     * @return true if email notifications are enabled, false otherwise
     */
    public Boolean getEmailNotificationsEnabled() { return emailNotificationsEnabled; }
    
    /**
     * Sets the email notifications enabled status
     * @param emailNotificationsEnabled true to enable email notifications, false to disable
     */
    public void setEmailNotificationsEnabled(Boolean emailNotificationsEnabled) { this.emailNotificationsEnabled = emailNotificationsEnabled; }
    
    /**
     * Gets the SMS notifications enabled status
     * @return true if SMS notifications are enabled, false otherwise
     */
    public Boolean getSmsNotificationsEnabled() { return smsNotificationsEnabled; }
    
    /**
     * Sets the SMS notifications enabled status
     * @param smsNotificationsEnabled true to enable SMS notifications, false to disable
     */
    public void setSmsNotificationsEnabled(Boolean smsNotificationsEnabled) { this.smsNotificationsEnabled = smsNotificationsEnabled; }
    
    /**
     * Gets the due date reminder advance period
     * @return Number of days before due date to send reminders
     */
    public Integer getDueDateReminderDays() { return dueDateReminderDays; }
    
    /**
     * Sets the due date reminder advance period
     * @param dueDateReminderDays Number of days before due date to send reminders
     */
    public void setDueDateReminderDays(Integer dueDateReminderDays) { this.dueDateReminderDays = dueDateReminderDays; }
    
    /**
     * Gets the overdue reminder frequency
     * @return Number of days after due date to send overdue reminders
     */
    public Integer getOverdueReminderDays() { return overdueReminderDays; }
    
    /**
     * Sets the overdue reminder frequency
     * @param overdueReminderDays Number of days after due date to send overdue reminders
     */
    public void setOverdueReminderDays(Integer overdueReminderDays) { this.overdueReminderDays = overdueReminderDays; }
    
    // Email Configuration Getters and Setters
    
    /**
     * Gets the email server hostname
     * @return SMTP server hostname
     */
    public String getEmailHost() { return emailHost; }
    
    /**
     * Sets the email server hostname
     * @param emailHost SMTP server hostname
     */
    public void setEmailHost(String emailHost) { this.emailHost = emailHost; }
    
    /**
     * Gets the email server port
     * @return SMTP server port number
     */
    public Integer getEmailPort() { return emailPort; }
    
    /**
     * Sets the email server port
     * @param emailPort SMTP server port number
     */
    public void setEmailPort(Integer emailPort) { this.emailPort = emailPort; }
    
    /**
     * Gets the email authentication username
     * @return SMTP username
     */
    public String getEmailUsername() { return emailUsername; }
    
    /**
     * Sets the email authentication username
     * @param emailUsername SMTP username
     */
    public void setEmailUsername(String emailUsername) { this.emailUsername = emailUsername; }
    
    /**
     * Gets the email authentication password
     * @return SMTP password
     */
    public String getEmailPassword() { return emailPassword; }
    
    /**
     * Sets the email authentication password
     * @param emailPassword SMTP password
     */
    public void setEmailPassword(String emailPassword) { this.emailPassword = emailPassword; }
    
    // SMS Configuration Getters and Setters
    
    /**
     * Gets the SMS service provider name
     * @return SMS provider name
     */
    public String getSmsProvider() { return smsProvider; }
    
    /**
     * Sets the SMS service provider name
     * @param smsProvider SMS provider name
     */
    public void setSmsProvider(String smsProvider) { this.smsProvider = smsProvider; }
    
    /**
     * Gets the SMS service API key
     * @return SMS API key
     */
    public String getSmsApiKey() { return smsApiKey; }
    
    /**
     * Sets the SMS service API key
     * @param smsApiKey SMS API key
     */
    public void setSmsApiKey(String smsApiKey) { this.smsApiKey = smsApiKey; }
    
    /**
     * Gets the SMS service username
     * @return SMS service username (e.g., Twilio Account SID)
     */
    public String getSmsUsername() { return smsUsername; }
    
    /**
     * Sets the SMS service username
     * @param smsUsername SMS service username (e.g., Twilio Account SID)
     */
    public void setSmsUsername(String smsUsername) { this.smsUsername = smsUsername; }
    
    /**
     * Gets the SMS sender phone number
     * @return Phone number used as SMS sender
     */
    public String getSmsFromNumber() { return smsFromNumber; }
    
    /**
     * Sets the SMS sender phone number
     * @param smsFromNumber Phone number used as SMS sender
     */
    public void setSmsFromNumber(String smsFromNumber) { this.smsFromNumber = smsFromNumber; }
    
    // Library Information Getters and Setters
    
    /**
     * Gets the library name
     * @return Official name of the library
     */
    public String getLibraryName() { return libraryName; }
    
    /**
     * Sets the library name
     * @param libraryName Official name of the library
     */
    public void setLibraryName(String libraryName) { this.libraryName = libraryName; }
    
    /**
     * Gets the library email address
     * @return Official email address of the library
     */
    public String getLibraryEmail() { return libraryEmail; }
    
    /**
     * Sets the library email address
     * @param libraryEmail Official email address of the library
     */
    public void setLibraryEmail(String libraryEmail) { this.libraryEmail = libraryEmail; }
    
    /**
     * Gets the library phone number
     * @return Main phone number of the library
     */
    public String getLibraryPhone() { return libraryPhone; }
    
    /**
     * Sets the library phone number
     * @param libraryPhone Main phone number of the library
     */
    public void setLibraryPhone(String libraryPhone) { this.libraryPhone = libraryPhone; }
    
    /**
     * Gets the library address
     * @return Physical address of the library
     */
    public String getLibraryAddress() { return libraryAddress; }
    
    /**
     * Sets the library address
     * @param libraryAddress Physical address of the library
     */
    public void setLibraryAddress(String libraryAddress) { this.libraryAddress = libraryAddress; }
    
    // Audit Information Getters and Setters
    
    /**
     * Gets the last update timestamp
     * @return Date and time of last settings modification
     */
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    
    /**
     * Sets the last update timestamp
     * @param lastUpdated Date and time of last settings modification
     */
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    
    /**
     * Gets the ID of the admin who last updated settings
     * @return Admin ID or username who made the last change
     */
    public String getUpdatedBy() { return updatedBy; }
    
    /**
     * Sets the ID of the admin who last updated settings
     * @param updatedBy Admin ID or username who made the last change
     */
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
