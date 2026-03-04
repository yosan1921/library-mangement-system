package com.example.lms.model;

// Spring Data MongoDB annotations for document mapping and indexing
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

/**
 * Librarian Entity - Represents library staff members
 * 
 * This class models librarian accounts with authentication and contact information.
 * Librarians are staff members who manage day-to-day library operations including
 * book management, member services, and transaction processing.
 * 
 * Key Responsibilities:
 * - Approve/reject book borrowing requests
 * - Manage book returns and calculate fines
 * - Handle member registrations and account management
 * - Process reservations and notifications
 * - Generate reports and manage inventory
 * 
 * Security Features:
 * - Unique constraints on username and email prevent duplicates
 * - Password field should store BCrypt hashed passwords
 * - Active flag allows account deactivation for security
 * 
 * Audit Features:
 * - Creation and update timestamps for account tracking
 * - Account status management for staff changes
 * 
 * Related Entities:
 * - Member: Librarians manage member accounts and services
 * - Book: Librarians manage book catalog and inventory
 * - BorrowRecord: Librarians approve/process borrowing transactions
 * - Fine: Librarians can waive or modify fines
 * 
 * MongoDB Collection: "librarians"
 * Indexes: username, email (both unique)
 */
@Document(collection = "librarians") // Maps this class to the "librarians" collection in MongoDB
public class Librarian {
    
    /**
     * Unique identifier for the librarian account
     * Generated automatically by MongoDB when a new librarian is created
     */
    @Id
    private String id;
    
    /**
     * Unique username for librarian authentication
     * Used for login and system identification
     * Indexed with unique constraint to prevent duplicates
     */
    @Indexed(unique = true)
    private String username;
    
    /**
     * Encrypted password for librarian authentication
     * Should be stored as BCrypt hash for security
     * Never store plain text passwords
     */
    private String password;
    
    /**
     * Full name of the librarian
     * Used for display purposes and staff identification
     */
    private String name;
    
    /**
     * Email address of the librarian
     * Used for notifications and account recovery
     * Indexed with unique constraint to prevent duplicate accounts
     */
    @Indexed(unique = true)
    private String email;
    
    /**
     * Phone number of the librarian
     * Used for contact and emergency communication
     */
    private String phone;
    
    /**
     * Active status of the librarian account
     * - true: Librarian can log in and access the system
     * - false: Account is deactivated (staff no longer employed)
     */
    private boolean active;
    
    /**
     * Timestamp when the librarian account was created
     * Used for audit trails and staff management
     */
    private java.util.Date createdAt;
    
    /**
     * Timestamp when the librarian account was last updated
     * Updated whenever librarian information is modified
     */
    private java.util.Date updatedAt;

    /**
     * Default constructor for MongoDB deserialization
     * Initializes default values for new librarian accounts:
     * - Sets active status to true
     * - Sets creation and update timestamps to current time
     */
    public Librarian() {
        this.active = true;                        // New librarians are active by default
        this.createdAt = new java.util.Date();    // Set creation timestamp
        this.updatedAt = new java.util.Date();    // Set initial update timestamp
    }

    // =============================================================================
    // GETTER AND SETTER METHODS
    // =============================================================================
    // These methods provide controlled access to the librarian's properties
    // Following JavaBean conventions for compatibility with Spring framework
    
    /**
     * Gets the unique identifier of the librarian
     * @return The librarian's MongoDB ObjectId as a string
     */
    public String getId() { return id; }
    
    /**
     * Sets the unique identifier of the librarian
     * @param id The librarian's MongoDB ObjectId as a string
     */
    public void setId(String id) { this.id = id; }

    /**
     * Gets the librarian's username
     * @return The unique username for authentication
     */
    public String getUsername() { return username; }
    
    /**
     * Sets the librarian's username
     * @param username The unique username for authentication
     */
    public void setUsername(String username) { this.username = username; }

    /**
     * Gets the librarian's encrypted password
     * @return The BCrypt hashed password
     */
    public String getPassword() { return password; }
    
    /**
     * Sets the librarian's encrypted password
     * @param password The BCrypt hashed password (never store plain text)
     */
    public void setPassword(String password) { this.password = password; }

    /**
     * Gets the librarian's full name
     * @return The full name
     */
    public String getName() { return name; }
    
    /**
     * Sets the librarian's full name
     * @param name The full name
     */
    public void setName(String name) { this.name = name; }

    /**
     * Gets the librarian's email address
     * @return The email address
     */
    public String getEmail() { return email; }
    
    /**
     * Sets the librarian's email address
     * @param email The email address
     */
    public void setEmail(String email) { this.email = email; }

    /**
     * Gets the librarian's phone number
     * @return The phone number
     */
    public String getPhone() { return phone; }
    
    /**
     * Sets the librarian's phone number
     * @param phone The phone number
     */
    public void setPhone(String phone) { this.phone = phone; }

    /**
     * Gets the active status of the librarian account
     * @return true if account is active, false if deactivated
     */
    public boolean isActive() { return active; }
    
    /**
     * Sets the active status of the librarian account
     * @param active true to activate account, false to deactivate
     */
    public void setActive(boolean active) { this.active = active; }

    /**
     * Gets the account creation timestamp
     * @return Date when the librarian account was created
     */
    public java.util.Date getCreatedAt() { return createdAt; }
    
    /**
     * Sets the account creation timestamp
     * @param createdAt Date when the librarian account was created
     */
    public void setCreatedAt(java.util.Date createdAt) { this.createdAt = createdAt; }

    /**
     * Gets the last update timestamp
     * @return Date when the librarian account was last updated
     */
    public java.util.Date getUpdatedAt() { return updatedAt; }
    
    /**
     * Sets the last update timestamp
     * @param updatedAt Date when the librarian account was last updated
     */
    public void setUpdatedAt(java.util.Date updatedAt) { this.updatedAt = updatedAt; }
}
