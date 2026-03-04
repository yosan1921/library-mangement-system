package com.example.lms.repository;

// Import the Reservation model class
import com.example.lms.model.Reservation;
// Spring Data MongoDB repository interface
import org.springframework.data.mongodb.repository.MongoRepository;
// Spring stereotype annotation for repository beans
import org.springframework.stereotype.Repository;
// Java collections class
import java.util.List;

/**
 * ReservationRepository Interface - Data Access Layer for Reservation entities
 * 
 * This repository interface provides database operations for Reservation entities,
 * which manage book reservation requests when books are unavailable. It extends
 * MongoRepository for basic CRUD operations and defines custom queries for
 * reservation management, queue processing, and member services.
 * 
 * Inherited Operations (from MongoRepository):
 * - save(Reservation reservation): Create or update a reservation
 * - findById(String id): Find reservation by ID
 * - findAll(): Retrieve all reservations
 * - deleteById(String id): Delete reservation by ID
 * - count(): Count total reservations
 * - existsById(String id): Check if reservation exists
 * 
 * Custom Query Methods:
 * - Member-based queries for personal reservation management
 * - Book-based queries for reservation queue management
 * - Status-based filtering for workflow processing
 * 
 * Business Use Cases:
 * - Member reservation history and current requests
 * - Book reservation queue management (first-come, first-served)
 * - Workflow processing (pending, approved, fulfilled reservations)
 * - Availability notifications when books become available
 * - Reservation expiry management and cleanup
 * 
 * Related Entities:
 * - Member: Each reservation belongs to a specific member
 * - Book: Each reservation is for a specific book
 * - BorrowRecord: Created when reservation is fulfilled
 * - Notification: Sent when reserved books become available
 */
@Repository // Marks this interface as a Spring Data repository component
public interface ReservationRepository extends MongoRepository<Reservation, String> {
    
    /**
     * Finds all reservations for a specific member
     * 
     * This method retrieves all reservation requests made by a member,
     * including past and current reservations. Used for member account
     * management, reservation history display, and personal queue tracking.
     * 
     * MongoDB Query: { "memberID": "memberID" }
     * 
     * @param memberID The ID of the member whose reservations to retrieve
     * @return List of all reservations for the specified member
     */
    List<Reservation> findByMemberID(String memberID);
    
    /**
     * Finds all reservations for a specific book
     * 
     * This method retrieves the reservation queue for a book, showing
     * all members waiting for the book to become available. Used for
     * queue management, availability notifications, and popularity analysis.
     * 
     * MongoDB Query: { "bookID": "bookID" }
     * 
     * @param bookID The ID of the book whose reservations to retrieve
     * @return List of all reservations for the specified book (reservation queue)
     */
    List<Reservation> findByBookID(String bookID);
    
    /**
     * Finds reservations by their current status
     * 
     * This method filters reservations based on their status in the
     * reservation workflow. Used for processing different stages of
     * reservations and managing the reservation lifecycle.
     * 
     * MongoDB Query: { "status": "status" }
     * 
     * Common status values:
     * - "PENDING": Reservation is active, waiting for book availability
     * - "APPROVED": Book is available, member has been notified
     * - "CANCELLED": Reservation was cancelled by member or system
     * - "FULFILLED": Member has borrowed the reserved book
     * 
     * @param status The status to filter by (PENDING, APPROVED, CANCELLED, FULFILLED)
     * @return List of reservations with the specified status
     */
    List<Reservation> findByStatus(String status);
}
