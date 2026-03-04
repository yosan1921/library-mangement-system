package com.example.lms.repository;

// Import the Admin model class
import com.example.lms.model.Admin;
// Spring Data MongoDB repository interface
import org.springframework.data.mongodb.repository.MongoRepository;
// Spring stereotype annotation for repository beans
import org.springframework.stereotype.Repository;
// Java collections and optional classes
import java.util.List;
import java.util.Optional;

/**
 * AdminRepository Interface - Data Access Layer for Admin entities
 * 
 * This repository interface provides database operations for Admin entities,
 * which represent system administrators and staff with elevated privileges.
 * It extends MongoRepository for basic CRUD operations and defines custom
 * queries for admin authentication, account management, and role-based access.
 * 
 * Inherited Operations (from MongoRepository):
 * - save(Admin admin): Create or update an admin account
 * - findById(String id): Find admin by ID
 * - findAll(): Retrieve all admin accounts
 * - deleteById(String id): Delete admin account
 * - count(): Count total admin accounts
 * - existsById(String id): Check if admin exists
 * 
 * Custom Query Methods:
 * - Authentication queries using unique identifiers
 * - Account status filtering for active/inactive admins
 * - Role-based queries for hierarchical access control
 * - Unique field lookups for duplicate prevention
 * 
 * Security Considerations:
 * - Username and email fields have unique constraints
 * - Password fields should contain BCrypt hashes only
 * - Active flag enables immediate account deactivation
 * - Role-based queries support permission hierarchies
 * 
 * Business Use Cases:
 * - Admin authentication and login processes
 * - Account creation and duplicate prevention
 * - Role-based access control and permissions
 * - Admin account management and auditing
 * - Active admin reporting and monitoring
 * 
 * Related Entities:
 * - SystemSettings: Admins can modify system configuration
 * - All other entities: Admins have management access based on role/permissions
 */
@Repository // Marks this interface as a Spring Data repository component
public interface AdminRepository extends MongoRepository<Admin, String> {
    
    /**
     * Finds an admin by their unique username
     * 
     * This method is primarily used for authentication processes where
     * admins log in with their username. Returns Optional since username
     * should be unique but may not exist in the database.
     * 
     * MongoDB Query: { "username": "username" }
     * 
     * @param username The unique username to search for
     * @return Optional containing the admin if found, empty if not found
     */
    Optional<Admin> findByUsername(String username);
    
    /**
     * Finds an admin by their unique email address
     * 
     * This method supports email-based authentication and account recovery
     * processes. Also used for duplicate email prevention during admin
     * account creation. Returns Optional since email should be unique.
     * 
     * MongoDB Query: { "email": "email" }
     * 
     * @param email The unique email address to search for
     * @return Optional containing the admin if found, empty if not found
     */
    Optional<Admin> findByEmail(String email);
    
    /**
     * Finds admins by their active status
     * 
     * This method filters admin accounts based on whether they are active
     * or deactivated. Used for admin account management, security auditing,
     * and ensuring only active admins can access the system.
     * 
     * MongoDB Query: { "active": active }
     * 
     * @param active true to find active admins, false for deactivated admins
     * @return List of admin accounts with the specified active status
     */
    List<Admin> findByActive(Boolean active);
    
    /**
     * Finds admins by their role level
     * 
     * This method filters admin accounts by their assigned role, supporting
     * hierarchical access control and role-based administration. Used for
     * permission management and administrative delegation.
     * 
     * MongoDB Query: { "role": "role" }
     * 
     * Common role values:
     * - "SUPER_ADMIN": Highest level with full system access
     * - "ADMIN": Administrative level with management capabilities
     * - "LIBRARIAN": Staff level with operational access
     * 
     * @param role The role to filter by (SUPER_ADMIN, ADMIN, LIBRARIAN)
     * @return List of admin accounts with the specified role
     */
    List<Admin> findByRole(String role);
}
