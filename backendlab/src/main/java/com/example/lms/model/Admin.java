package com.example.lms.model;

// Spring Data MongoDB annotations for document mapping
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
// Java time API for timestamp handling
import java.time.LocalDateTime;
// Java collections for permissions list
import java.util.List;

/**
 * Admin Entity - Represents system administrators and staff members
 * 
 * This class models administrative users who have elevated privileges in the
 * Library Management System. It supports a hierarchical role system with
 * granular permissions for different administrative functions.
 * 
 * Role Hierarchy:
 * - SUPER_ADMIN: Full system access, can manage other admins
 * - ADMIN: Administrative access, can manage library operations
 * - LIBRARIAN: Library staff access, can manage books and members
 * 
 * Key Features:
 * - Role-based access control with granular permissions
 * - Account activation/deactivation for security
 * - Audit trail with creation tracking and login history
 * - Secure password storage (should be BCrypt hashed)
 * - Permission system for fine-grained access control
 * 
 * Security Considerations:
 * - Passwords should always be stored as BCrypt hashes
 * - Active flag allows immediate account deactivation
 * - Last login tracking for security monitoring
 * - Created by tracking for accountability
 * 
 * Related Entities:
 * - SystemSettings: Admins can modify system configuration
 * - All other entities: Admins have management access based on permissions
 * 
 * MongoDB Collection: "admins"
 */
@Document(collection = "admins") // Maps this class to the "admins" collection in MongoDB
public class Admin {
    
    /**
     * Unique identifier for the admin account
     * Generated automatically by MongoDB when a new admin is created
     */
    @Id
    private String id;
    
    /**
     * Unique username for admin authentication
     * Used for login and system identification
     * Should be unique across all admin accounts
     */
    private String username;
    
    /**
     * Encrypted password for admin authentication
     * SECURITY NOTE: In production, this should always be BCrypt hashed
     * Never store plain text passwords for security reasons
     */
    private String password; // In production, this should be hashed
    
    /**
     * Email address of the admin
     * Used for notifications and account recovery
     * Should be unique and valid for communication
     */
    private String email;
    
    /**
     * Full name of the admin user
     * Used for display purposes and identification in audit logs
     */
    private String fullName;
    
    /**
     * Phone number of the admin
     * Used for contact and emergency communication
     */
    private String phone;
    
    /**
     * Role level of the admin
     * 
     * Possible values:
     * - "SUPER_ADMIN": Highest level, can manage other admins and system settings
     * - "ADMIN": Administrative level, can manage library operations
     * - "LIBRARIAN": Staff level, can manage books, members, and daily operations
     * 
     * Determines base level of access and available functions
     */
    private String role; // SUPER_ADMIN, ADMIN, LIBRARIAN
    
    /**
     * List of specific permissions granted to this admin
     * Provides granular control over system functions beyond role-based access
     * 
     * Example permissions:
     * - "MANAGE_BOOKS": Can add, edit, delete books
     * - "MANAGE_MEMBERS": Can manage member accounts
     * - "VIEW_REPORTS": Can access system reports
     * - "MANAGE_FINES": Can waive or modify fines
     * - "SYSTEM_SETTINGS": Can modify system configuration
     */
    private List<String> permissions;
    
    /**
     * Active status of the admin account
     * - true: Admin can log in and access the system
     * - false: Account is deactivated (immediate access revocation)
     */
    private Boolean active;
    
    /**
     * Timestamp when the admin account was created
     * Used for audit trails and account management
     */
    private LocalDateTime createdDate;
    
    /**
     * Timestamp of the admin's last successful login
     * Used for security monitoring and inactive account identification
     */
    private LocalDateTime lastLogin;
    
    /**
     * ID or username of the admin who created this account
     * Provides accountability and audit trail for admin account creation
     */
    private String createdBy;
    
    /**
     * Profile photo filename or path
     * Stores the filename of the uploaded profile photo
     * Used to retrieve and display the admin's profile picture
     */
    private String profilePhoto;

    /**
     * Default constructor for MongoDB deserialization
     * Initializes default values for new admin accounts:
     * - Sets active status to true
     * - Sets creation timestamp to current time
     */
    public Admin() {
        this.active = true;                      // New admins are active by default
        this.createdDate = LocalDateTime.now();  // Set creation timestamp
    }

    // =============================================================================
    // GETTER AND SETTER METHODS
    // =============================================================================
    // These methods provide controlled access to the admin's properties
    // Following JavaBean conventions for compatibility with Spring framework
    
    /**
     * Gets the unique identifier of the admin
     * @return The admin's MongoDB ObjectId as a string
     */
    public String getId() { return id; }
    
    /**
     * Sets the unique identifier of the admin
     * @param id The admin's MongoDB ObjectId as a string
     */
    public void setId(String id) { this.id = id; }
    
    /**
     * Gets the admin's username
     * @return The unique username for authentication
     */
    public String getUsername() { return username; }
    
    /**
     * Sets the admin's username
     * @param username The unique username for authentication
     */
    public void setUsername(String username) { this.username = username; }
    
    /**
     * Gets the admin's encrypted password
     * @return The BCrypt hashed password
     */
    public String getPassword() { return password; }
    
    /**
     * Sets the admin's encrypted password
     * @param password The BCrypt hashed password (never store plain text)
     */
    public void setPassword(String password) { this.password = password; }
    
    /**
     * Gets the admin's email address
     * @return The email address
     */
    public String getEmail() { return email; }
    
    /**
     * Sets the admin's email address
     * @param email The email address
     */
    public void setEmail(String email) { this.email = email; }
    
    /**
     * Gets the admin's full name
     * @return The full name
     */
    public String getFullName() { return fullName; }
    
    /**
     * Sets the admin's full name
     * @param fullName The full name
     */
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    /**
     * Gets the admin's phone number
     * @return The phone number
     */
    public String getPhone() { return phone; }
    
    /**
     * Sets the admin's phone number
     * @param phone The phone number
     */
    public void setPhone(String phone) { this.phone = phone; }
    
    /**
     * Gets the admin's role level
     * @return The role (SUPER_ADMIN, ADMIN, or LIBRARIAN)
     */
    public String getRole() { return role; }
    
    /**
     * Sets the admin's role level
     * @param role The role (SUPER_ADMIN, ADMIN, or LIBRARIAN)
     */
    public void setRole(String role) { this.role = role; }
    
    /**
     * Gets the list of specific permissions
     * @return List of permission strings
     */
    public List<String> getPermissions() { return permissions; }
    
    /**
     * Sets the list of specific permissions
     * @param permissions List of permission strings
     */
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }
    
    /**
     * Gets the active status of the admin account
     * @return true if account is active, false if deactivated
     */
    public Boolean getActive() { return active; }
    
    /**
     * Sets the active status of the admin account
     * @param active true to activate account, false to deactivate
     */
    public void setActive(Boolean active) { this.active = active; }
    
    /**
     * Gets the account creation timestamp
     * @return Date and time when account was created
     */
    public LocalDateTime getCreatedDate() { return createdDate; }
    
    /**
     * Sets the account creation timestamp
     * @param createdDate Date and time when account was created
     */
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    
    /**
     * Gets the last login timestamp
     * @return Date and time of last successful login (null if never logged in)
     */
    public LocalDateTime getLastLogin() { return lastLogin; }
    
    /**
     * Sets the last login timestamp
     * @param lastLogin Date and time of last successful login
     */
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
    
    /**
     * Gets the ID of the admin who created this account
     * @return The creator's ID or username
     */
    public String getCreatedBy() { return createdBy; }
    
    /**
     * Sets the ID of the admin who created this account
     * @param createdBy The creator's ID or username
     */
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    /**
     * Gets the profile photo filename
     * @return The filename of the profile photo (null if no photo uploaded)
     */
    public String getProfilePhoto() { return profilePhoto; }
    
    /**
     * Sets the profile photo filename
     * @param profilePhoto The filename of the profile photo
     */
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
}
