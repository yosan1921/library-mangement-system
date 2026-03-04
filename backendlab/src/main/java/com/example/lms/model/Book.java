package com.example.lms.model;

// Spring Data MongoDB annotations for document mapping
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Book Entity - Represents a book in the library catalog
 * 
 * This class models a book with all its essential properties for library management.
 * Each book has a unique identifier and tracks both total copies owned by the library
 * and currently available copies for borrowing.
 * 
 * The book entity is central to the LMS and is referenced by:
 * - BorrowRecord: Tracks which books are borrowed by members
 * - Reservation: Allows members to reserve books that are currently unavailable
 * - Fine: Calculated based on overdue book returns
 * 
 * MongoDB Collection: "books"
 * Indexes: Should be created on frequently queried fields like title, author, category, isbn
 */
@Document(collection = "books") // Maps this class to the "books" collection in MongoDB
public class Book {
    
    /**
     * Unique identifier for the book
     * Generated automatically by MongoDB when a new book is created
     */
    @Id
    private String id;
    
    /**
     * Title of the book
     * Used for searching and displaying book information to users
     */
    private String title;
    
    /**
     * Author(s) of the book
     * Can contain multiple authors separated by commas
     */
    private String author;
    
    /**
     * Category/Genre of the book
     * Used for organizing books and filtering search results
     * Examples: Fiction, Non-Fiction, Science, History, etc.
     */
    private String category;
    
    /**
     * International Standard Book Number (ISBN)
     * Unique identifier for book editions, used for cataloging and identification
     */
    private String isbn;
    
    /**
     * Number of copies currently available for borrowing
     * This number decreases when books are borrowed and increases when returned
     * Must always be <= totalCopies
     */
    private Integer copiesAvailable;
    
    /**
     * Total number of copies owned by the library
     * This includes both available and currently borrowed copies
     * Used to track library inventory and determine if more copies should be purchased
     */
    private Integer totalCopies;

    /**
     * Default constructor required by MongoDB for object deserialization
     * Spring Data MongoDB uses this constructor when retrieving documents from the database
     */
    public Book() {
    }

    // =============================================================================
    // GETTER AND SETTER METHODS
    // =============================================================================
    // These methods provide controlled access to the book's properties
    // Following JavaBean conventions for compatibility with Spring framework
    
    /**
     * Gets the unique identifier of the book
     * @return The book's MongoDB ObjectId as a string
     */
    public String getId() { return id; }
    
    /**
     * Sets the unique identifier of the book
     * @param id The book's MongoDB ObjectId as a string
     */
    public void setId(String id) { this.id = id; }
    
    /**
     * Gets the title of the book
     * @return The book's title
     */
    public String getTitle() { return title; }
    
    /**
     * Sets the title of the book
     * @param title The book's title
     */
    public void setTitle(String title) { this.title = title; }
    
    /**
     * Gets the author(s) of the book
     * @return The book's author(s)
     */
    public String getAuthor() { return author; }
    
    /**
     * Sets the author(s) of the book
     * @param author The book's author(s)
     */
    public void setAuthor(String author) { this.author = author; }
    
    /**
     * Gets the category/genre of the book
     * @return The book's category
     */
    public String getCategory() { return category; }
    
    /**
     * Sets the category/genre of the book
     * @param category The book's category
     */
    public void setCategory(String category) { this.category = category; }
    
    /**
     * Gets the ISBN of the book
     * @return The book's ISBN
     */
    public String getIsbn() { return isbn; }
    
    /**
     * Sets the ISBN of the book
     * @param isbn The book's ISBN
     */
    public void setIsbn(String isbn) { this.isbn = isbn; }
    
    /**
     * Gets the number of copies currently available for borrowing
     * @return Number of available copies
     */
    public Integer getCopiesAvailable() { return copiesAvailable; }
    
    /**
     * Sets the number of copies currently available for borrowing
     * @param copiesAvailable Number of available copies (must be <= totalCopies)
     */
    public void setCopiesAvailable(Integer copiesAvailable) { this.copiesAvailable = copiesAvailable; }
    
    /**
     * Gets the total number of copies owned by the library
     * @return Total number of copies
     */
    public Integer getTotalCopies() { return totalCopies; }
    
    /**
     * Sets the total number of copies owned by the library
     * @param totalCopies Total number of copies (must be >= copiesAvailable)
     */
    public void setTotalCopies(Integer totalCopies) { this.totalCopies = totalCopies; }
}
