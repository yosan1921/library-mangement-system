package com.example.lms.service;

import com.example.lms.model.Librarian;
import com.example.lms.repository.LibrarianRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LibrarianService {
    
    @Autowired
    private LibrarianRepository librarianRepository;
    
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Librarian registerLibrarian(Librarian librarian) {
        if (librarianRepository.findByUsername(librarian.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (librarianRepository.findByEmail(librarian.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        librarian.setPassword(passwordEncoder.encode(librarian.getPassword()));
        librarian.setActive(true);
        librarian.setCreatedAt(new java.util.Date());
        librarian.setUpdatedAt(new java.util.Date());
        
        return librarianRepository.save(librarian);
    }

    public Librarian updateLibrarian(String id, Librarian librarian) {
        Optional<Librarian> existing = librarianRepository.findById(id);
        if (!existing.isPresent()) {
            throw new RuntimeException("Librarian not found");
        }
        
        Librarian updated = existing.get();
        updated.setName(librarian.getName());
        updated.setEmail(librarian.getEmail());
        updated.setPhone(librarian.getPhone());
        updated.setUpdatedAt(new java.util.Date());
        
        return librarianRepository.save(updated);
    }

    public void deactivateLibrarian(String id) {
        Optional<Librarian> librarian = librarianRepository.findById(id);
        if (!librarian.isPresent()) {
            throw new RuntimeException("Librarian not found");
        }
        
        Librarian lib = librarian.get();
        lib.setActive(false);
        lib.setUpdatedAt(new java.util.Date());
        librarianRepository.save(lib);
    }

    public Optional<Librarian> getLibrarianById(String id) {
        return librarianRepository.findById(id);
    }

    public Optional<Librarian> getLibrarianByUsername(String username) {
        return librarianRepository.findByUsername(username);
    }

    public List<Librarian> getAllActiveLibrarians() {
        return librarianRepository.findByActiveTrue();
    }

    public List<Librarian> getAllLibrarians() {
        return librarianRepository.findAll();
    }
}
