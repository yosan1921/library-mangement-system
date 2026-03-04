package com.example.lms.repository;

// Import the Member model class
import com.example.lms.model.Member;
// Spring Data MongoDB repository interface
import org.springframework.data.mongodb.repository.MongoRepository;
// Spring stereotype annotation for repository beans
import org.springframework.stereotype.Repository;
// Java collections and optional classes
import java.util.Optional;
import java.util.List;

/**
 * MemberRepository Interface - Data Access Layer for Member entities
 * 
 * This repository interface provides database operations for Member entities,
 * which represent library users with authentication and account information.
 * It extends MongoRepository for basic CRUD operations and defines custom
 * queries for member authentication, account management, and user administration.
 * 
 * Inherited Operations (from MongoRepository):
 * - save(Member member): Create or update a member account
 * - findById(String id): Find member by ID
 * - findAll(): Retrieve all members
 * - deleteById(String id): Delete member account
 * - count(): Count total members
 * - existsById(String id): Check if member exists
 * 
 * Custom Query Methods:
 * - Authentication queries using unique identifiers
 * - Account status filtering for active/inactive members
 * - Role-based queries for user management
 * - Unique field lookups for duplicate prevention
 * 
 * Security Considerations:
 * - All unique fields (username, email, membershipID) have database constraints
 * - Password fields should always contain BCrypt hashes, never plain text
 * - Active flag allows immediate account deactivation for security
 * 
 * Business Use Cases:
 * - User authentication and login processes
 * - Account registration and duplicate prevention
 * - Member account management and administration
 * - Role-based access control and permissions
 * - Active member reporting and statistics
 * 
 * Related Entities:
 * - BorrowRecord: Members have borrowing history
 * - Reservation: Members can reserve books
 * - Fine: Members may owe fines for overdue books
 * - Notification: Members receive system notifications
 */
@Repository // Marks this interface as a Spring Data repository component
public interface MemberRepository extends MongoRepository<Member, String> {
    
    /**
     * Finds a member by their unique membership ID
     * 
     * This method looks up a member using their physical membership ID,
     * which is typically printed on library cards. Returns Optional since
     * the membership ID should be unique but may not exist in the database.
     * 
     * MongoDB Query: { "membershipID": "membershipID" }
     * 
     * @param membershipID The unique membership ID to search for
     * @return Optional containing the member if found, empty if not found
     */
    Optional<Member> findByMembershipID(String membershipID);
    
    /**
     * Finds a member by their unique username
     * 
     * This method is primarily used for authentication processes where
     * users log in with their username. Returns Optional since username
     * should be unique but may not exist in the database.
     * 
     * MongoDB Query: { "username": "username" }
     * 
     * @param username The unique username to search for
     * @return Optional containing the member if found, empty if not found
     */
    Optional<Member> findByUsername(String username);
    
    /**
     * Finds a member by their unique email address
     * 
     * This method supports email-based authentication and account recovery
     * processes. Also used for duplicate email prevention during registration.
     * Returns Optional since email should be unique but may not exist.
     * 
     * MongoDB Query: { "email": "email" }
     * 
     * @param email The unique email address to search for
     * @return Optional containing the member if found, empty if not found
     */
    Optional<Member> findByEmail(String email);
    
    /**
     * Finds members by their active status
     * 
     * This method filters members based on whether their accounts are active
     * or deactivated. Used for member administration, reporting, and ensuring
     * only active members can access library services.
     * 
     * MongoDB Query: { "active": active }
     * 
     * @param active true to find active members, false for deactivated members
     * @return List of members with the specified active status
     */
    List<Member> findByActive(Boolean active);
    
    /**
     * Finds members by their role in the system
     * 
     * This method filters members by their assigned role, supporting
     * role-based access control and user management. Used for administrative
     * functions and permission management.
     * 
     * MongoDB Query: { "role": "role" }
     * 
     * Common role values:
     * - "member": Regular library member with borrowing privileges
     * - "librarian": Staff member with management capabilities
     * - "admin": Administrator with full system access
     * 
     * @param role The role to filter by (member, librarian, admin)
     * @return List of members with the specified role
     */
    List<Member> findByRole(String role);
}
