package com.example.lms.repository;

import com.example.lms.model.Book;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends MongoRepository<Book, String> {
    List<Book> findByTitleContainingIgnoreCase(String title);
    List<Book> findByAuthorContainingIgnoreCase(String author);
    List<Book> findByCategory(String category);
    Optional<Book> findByIsbn(String isbn);
    List<Book> findByCopiesAvailableGreaterThan(Integer copies);
}
