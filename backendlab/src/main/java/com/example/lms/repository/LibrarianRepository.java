package com.example.lms.repository;

import com.example.lms.model.Librarian;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface LibrarianRepository extends MongoRepository<Librarian, String> {
    Optional<Librarian> findByUsername(String username);
    Optional<Librarian> findByEmail(String email);
    List<Librarian> findByActiveTrue();
}
