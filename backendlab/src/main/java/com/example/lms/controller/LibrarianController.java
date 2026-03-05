package com.example.lms.controller;

import com.example.lms.model.Librarian;
import com.example.lms.service.LibrarianService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/librarians")
@CrossOrigin(origins = "*")
public class LibrarianController {

    @Autowired
    private LibrarianService librarianService;

    @PostMapping
    public ResponseEntity<?> registerLibrarian(@RequestBody Librarian librarian) {
        try {
            Librarian created = librarianService.registerLibrarian(librarian);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLibrarian(@PathVariable String id, @RequestBody Librarian librarian) {
        try {
            Librarian updated = librarianService.updateLibrarian(id, librarian);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateLibrarian(@PathVariable String id) {
        try {
            librarianService.deactivateLibrarian(id);
            return ResponseEntity.ok("Librarian deactivated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLibrarianById(@PathVariable String id) {
        Optional<Librarian> librarian = librarianService.getLibrarianById(id);
        if (librarian.isPresent()) {
            return ResponseEntity.ok(librarian.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Librarian not found");
    }

    @GetMapping
    public ResponseEntity<List<Librarian>> getAllLibrarians() {
        return ResponseEntity.ok(librarianService.getAllLibrarians());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Librarian>> getActiveLibrarians() {
        return ResponseEntity.ok(librarianService.getAllActiveLibrarians());
    }
}
