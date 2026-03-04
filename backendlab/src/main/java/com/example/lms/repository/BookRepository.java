package com.example.lms.repository;

// Import the Book model class
import com.example.lms.model.Book;
// Spring Data MongoDB repository interface
import org.springframework.data.mongodb.repository.MongoRepository;
// Spring stereotype annotation for repository beans
import org.springframework.stereotype.Repository;
// Java collections and optional classes
import java.util.List;
import java.util.Optional;

/**
 * BookRepository Interface - Data Access Layer for Book entities
 * 
 * This repository interface provides database operations for Book entities using
 * Spring Data MongoDB. It extends MongoRepository to inherit basic CRUD operations
 * and defines custom query methods for book-specific search and filtering needs.
 * 
 * Inherited Operations (from MongoRepository):
 * - save(Book book): Create or update a book
 * - findById(String id): Find book by ID
 * - findAll(): Retrieve all books
 * - deleteById(String id): Delete book by ID
 * - count(): Count total books
 * - existsById(String id): Check if book exists
 * 
 * Custom Query Methods:
 * - Title-based search with case-insensitive partial matching
 * - Author-based search with case-insensitive partial matching
 * - Category-based filtering for book organization
 * - ISBN-based lookup for unique book identification
 * - Availability-based filtering for borrowing operations
 * 
 * Query Method Naming Convention:
 * Spring Data MongoDB automatically implements these methods based on their names.
 * The method names follow a specific pattern that Spring translates to MongoDB queries.
 * 
 * Usage Examples:
 * - bookRepository.findByTitleContainingIgnoreCase("java") → finds books with "java" in title
 * - bookRepository.findByCategory("Fiction") → finds all fiction books
 * - bookRepository.findByCopiesAvailableGreaterThan(0) → finds available books
 * 
 * Related Entities:
 * - BorrowRecord: Books are referenced in borrowing transactions
 * - Reservation: Books can be reserved when unavailable
 * - Fine: Overdue books generate fines
 */
@Repository // Marks this interface as a Spring Data repository component
public interface BookRepository extends MongoRepository<Book, String> {
    
    /**
     * Finds books by title with case-insensitive partial matching
     * 
     * This method performs a case-insensitive search for books whose titles
     * contain the specified string. Useful for implementing search functionality
     * where users can find books by typing part of the title.
     * 
     * MongoDB Query: { "title": { "$regex": "title", "$options": "i" } }
     * 
     * @param title The title or partial title to search for
     * @return List of books whose titles contain the search term (case-insensitive)
     */
    List<Book> findByTitleContainingIgnoreCase(String title);
    
    /**
     * Finds books by author with case-insensitive partial matching
     * 
     * This method performs a case-insensitive search for books whose author field
     * contains the specified string. Supports searching for books by author name
     * or partial author name.
     * 
     * MongoDB Query: { "author": { "$regex": "author", "$options": "i" } }
     * 
     * @param author The author name or partial author name to search for
     * @return List of books whose author field contains the search term (case-insensitive)
     */
    List<Book> findByAuthorContainingIgnoreCase(String author);
    
    /**
     * Finds books by exact category match
     * 
     * This method retrieves all books that belong to a specific category.
     * Used for filtering books by genre or subject area for organized browsing.
     * 
     * MongoDB Query: { "category": "category" }
     * 
     * @param category The exact category name to filter by
     * @return List of books in the specified category
     */
    List<Book> findByCategory(String category);
    
    /**
     * Finds a book by its ISBN (International Standard Book Number)
     * 
     * This method looks up a book using its unique ISBN identifier.
     * Returns Optional since ISBN should be unique, but may not exist.
     * Used for precise book identification and duplicate prevention.
     * 
     * MongoDB Query: { "isbn": "isbn" }
     * 
     * @param isbn The ISBN to search for
     * @return Optional containing the book if found, empty if not found
     */
    Optional<Book> findByIsbn(String isbn);
    
    /**
     * Finds books with available copies for borrowing
     * 
     * This method retrieves books that have more than the specified number
     * of available copies. Commonly used with parameter 0 to find all
     * books that are currently available for borrowing.
     * 
     * MongoDB Query: { "copiesAvailable": { "$gt": copies } }
     * 
     * @param copies The minimum number of available copies (typically 0)
     * @return List of books with more than the specified available copies
     */
    List<Book> findByCopiesAvailableGreaterThan(Integer copies);
}
