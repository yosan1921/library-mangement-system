package com.example.lms.service;

import com.example.lms.model.Book;
import com.example.lms.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BookService {
    
    @Autowired
    private BookRepository bookRepository;
    
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
    
    public Optional<Book> getBookById(String id) {
        return bookRepository.findById(id);
    }
    
    public Book addBook(Book book) {
        return bookRepository.save(book);
    }
    
    public Book updateBook(String id, Book bookDetails) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found"));
        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setCategory(bookDetails.getCategory());
        book.setIsbn(bookDetails.getIsbn());
        book.setCopiesAvailable(bookDetails.getCopiesAvailable());
        book.setTotalCopies(bookDetails.getTotalCopies());
        return bookRepository.save(book);
    }
    
    public void deleteBook(String id) {
        bookRepository.deleteById(id);
    }
    
    public List<Book> searchByTitle(String title) {
        return bookRepository.findByTitleContainingIgnoreCase(title);
    }
    
    public List<Book> searchByAuthor(String author) {
        return bookRepository.findByAuthorContainingIgnoreCase(author);
    }
    
    public List<Book> getBooksByCategory(String category) {
        return bookRepository.findByCategory(category);
    }
    
    public List<Book> getAvailableBooks() {
        return bookRepository.findByCopiesAvailableGreaterThan(0);
    }
}
