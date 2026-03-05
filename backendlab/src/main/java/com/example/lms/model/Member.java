package com.example.lms.model;

// Spring Data MongoDB annotations for document mapping and indexing
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
// Java Date class for timestamp fields
import java.util.Date;

/**
 * Member Entity - Represents a library member/user
 * 
 * This class models a library member with authentication credentials, contact information,
 * and membership details. Members can borrow books, make reservations, and receive notifications.
 * 
 * The member entity supports different roles:
 * - "member": Regular library member with borrowing privileges
 * - "librarian": Staff member with additional management capabilities
 * - "admin": Administrator with full system access
 * 
 * Security Features:
 * - Unique constraints on username, email, and membershipID prevent duplicates
 * - Password field stores BCrypt hashed passwords for security
 * - Active flag allows soft deletion/deactivation of accounts
 * 
 * MongoDB Collection: "members"
 * Indexes: username, email, membershipID (all unique)
 */
@Document(collection = "members") // Maps this class to the "members" collection in MongoDB
public class Member {
    
    /**
     * Unique identifier for the member
     * Generated automatically by MongoDB when a new member is created
     */
    @Id
    private String id;
    
    /**
     * Full name of the member
     * Used for display purposes and identification
     */
    private String name;
    
    /**
     * Unique username for member authentication
     * Used for login along with password
     * Indexed with unique constraint to prevent duplicates
     */
    @Indexed(unique = true)
    private String username;
    
    /**
     * Email address of the member
     * Used for notifications and as an alternative login method
     * Indexed with unique constraint to prevent duplicate accounts
     */
    @Indexed(unique = true)
    private String email;
    
    /**
     * Encrypted password for member authentication
     * Stored as BCrypt hash for security - never store plain text passwords
     */
    private String password;
    
    /**
     * Contact information (phone number)
     * Used for SMS notifications and emergency contact
     */
    private String contact;
    
    /**
     * Unique membership ID assigned to each member
     * Used for physical identification cards and library records
     * Indexed with unique constraint to prevent duplicates
     */
    @Indexed(unique = true)
    private String membershipID;
    
    /**
     * Active status of the member account
     * - true: Member can log in and use library services
     * - false: Account is deactivated (soft delete)
     */
    private Boolean active;
    
    /**
     * Role of the member in the system
     * Possible values:
     * - "member": Regular library member
     * - "librarian": Library staff with management privileges
     * - "admin": System administrator with full access
     */
    private String ;
    
    /**
     * Timestamp when the member account was created
     * Used for audit trails and membership duration tracking
     */
    private Date createdAt;
    
    /**
     * Timestamp when the member account was last updated
     * Updated whenever member information is modified
     */
    private Date updatedAt;

    /**
     * Default constructor for MongoDB deserialization
     * Initializes default values for new members:
     * - Sets active status to true
     * - Assigns default role as "member"
     * - Sets creation and update timestamps to current time
     */
    public Member() {
        this.active = true;           // New members are active by default
        this.role = "member";         // Default role is regular member
        this.createdAt = new Date();  // Set creation timestamp
        this.updatedAt = new Date();  // Set initial update timestamp
    }

    // =============================================================================
    // GETTER AND SETTER METHODS
    // =============================================================================
    // These methods provide controlled access to the member's properties
    // Following JavaBean conventions for compatibility with Spring framework
    
    /**
     * Gets the unique identifier of the member
     * @return The member's MongoDB ObjectId as a string
     */
    public String getId() { return id; }
    
    /**
     * Sets the unique identifier of the member
     * @param id The member's MongoDB ObjectId as a string
     */
    public void setId(String id) { this.id = id; }
    
    /**
     * Gets the full name of the member
     * @return The member's full name
     */
    public String getName() { return name; }
    
    /**
     * Sets the full name of the member
     * @param name The member's full name
     */
    public void setName(String name) { this.name = name; }
    
    /**
     * Gets the username for authentication
     * @return The member's unique username
     */
    public String getUsername() { return username; }
    
    /**
     * Sets the username for authentication
     * @param username The member's unique username
     */
    public void setUsername(String username) { this.username = username; }
    
    /**
     * Gets the email address of the member
     * @return The member's email address
     */
    public String getEmail() { return email; }
    
    /**
     * Sets the email address of the member
     * @param email The member's email address
     */
    public void setEmail(String email) { this.email = email; }
    
    /**
     * Gets the encrypted password
     * @return The BCrypt hashed password
     */
    public String getPassword() { return password; }
    
    /**
     * Sets the encrypted password
     * @param password The BCrypt hashed password (never store plain text)
     */
    public void setPassword(String password) { this.password = password; }
    
    /**
     * Gets the contact information (phone number)
     * @return The member's contact information
     */
    public String getContact() { return contact; }
    
    /**
     * Sets the contact information (phone number)
     * @param contact The member's contact information
     */
    public void setContact(String contact) { this.contact = contact; }
    
    /**
     * Gets the unique membership ID
     * @return The member's membership ID
     */
    public String getMembershipID() { return membershipID; }
    
    /**
     * Sets the unique membership ID
     * @param membershipID The member's membership ID
     */
    public void setMembershipID(String membershipID) { this.membershipID = membershipID; }
    
    /**
     * Gets the active status of the member
     * @return true if member is active, false if deactivated
     */
    public Boolean getActive() { return active; }
    
    /**
     * Sets the active status of the member
     * @param active true to activate member, false to deactivate
     */
    public void setActive(Boolean active) { this.active = active; }
    
    /**
     * Gets the role of the member
     * @return The member's role (member, librarian, or admin)
     */
    public String getRole() { return role; }
    
    /**
     * Sets the role of the member
     * @param role The member's role (member, librarian, or admin)
     */
    public void setRole(String role) { this.role = role; }
    
    /**
     * Gets the account creation timestamp
     * @return Date when the member account was created
     */
    public Date getCreatedAt() { return createdAt; }
    
    /**
     * Sets the account creation timestamp
     * @param createdAt Date when the member account was created
     */
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    
    /**
     * Gets the last update timestamp
     * @return Date when the member account was last updated
     */
    public Date getUpdatedAt() { return updatedAt; }
    
    /**
     * Sets the last update timestamp
     * @param updatedAt Date when the member account was last updated
     */
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}
