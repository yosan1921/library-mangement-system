package com.example.lms.repository;

// Import the Librarian model class
import com.example.lms.model.Librarian;
// Spring Data MongoDB repository interface
import org.springframework.data.mongodb.repository.MongoRepository;
// Spring stereotype annotation for repository beans
import org.springframework.stereotype.Repository;

// Java collections and optional classes
import java.util.Optional;
//import java.util.List;

/**
 * LibrarianRepository Interface - Data Access Layer for Librarian entities
 * 
 * This repository interface provides database operations for Librarian entities,
 * which represent library staff members with operational privileges. It extends
 * MongoRepository for basic CRUD operations and defines custom queries for
 * librarian authentication, account management, and staff administration.
 * 
 * Inherited Operations (from MongoRepository):
 * - save(Librarian librarian): Create or update a librarian account
 * - findById(String id): Find librarian by ID
 * - findAll(): Retrieve all librarian accounts
 * - deleteById(String id): Delete librarian account
 * - count(): Count total librarian accounts
 * - existsById(String id): Check if librarian exists
 * 
 * Custom Query Methods:
 * - Authentication queries using unique identifiers
 * - Active staff filtering for operational management
 * - Unique field lookups for duplicate prevention
 * 
 * Security Considerations:
 * - Username and email fields have unique constraints
 * - Password fields should contain BCrypt hashes only
 * - Active flag enables immediate account deactivation
 * - Limited to operational staff functions (not admin functions)
 * 
 * Business Use Cases:
 * - Librarian authentication and login processes
 * - Staff account creation and duplicate prevention
 * - Active staff management and scheduling
 * - Operational access control and permissions
 * - Staff directory and contact management
 * 
 * Related Entities:
 * - BorrowRecord: Librarians approve/process borrowing transactions
 * - Member: Librarians manage member accounts and services
 * - Book: Librarians manage book catalog and inventory
 * - Fine: Librarians can waive or modify fines
 * - Reservation: Librarians process reservation fulfillment
 */
@Repository // Marks this interface as a Spring Data repository component
public interface LibrarianRepository extends MongoRepository<Librarian, String> {
    
    /**
     * Finds a librarian by their unique username
     * 
     * This method is primarily used for authentication processes where
     * librarians log in with their username. Returns Optional since username
     * should be unique but may not exist in the database.
     * 
     * MongoDB Query: { "username": "username" }
     * 
     * @param username The unique username to search for
     * @return Optional containing the librarian if found, empty if not found
     */
    Optional<Librarian> findByUsername(String username);
    
    /**
     * Finds a librarian by their unique email address
     * 
     * This method supports email-based authentication and account recovery
     * processes. Also used for duplicate email prevention during librarian
     * account creation. Returns Optional since email should be unique.
     * 
     * MongoDB Query: { "email": "email" }
     * 
     * @param email The unique email address to search for
     * @return Optional containing the librarian if found, empty if not found
     */
    Optional<Librarian> findByEmail(String email);
    
    /**
     * Finds all active librarian accounts
     * 
     * This method retrieves only librarians with active status set to true.
     * Used for staff management, scheduling, and ensuring only active staff
     * can access operational functions. Equivalent to findByActive(true).
     * 
     * MongoDB Query: { "active": true }
     * 
     * @return List of all active librarian accounts
     */
    List<Librarian> findByActiveTrue();
}
