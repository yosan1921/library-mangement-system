package com.example.lms.controller;

import com.example.lms.model.BorrowRecord;
import com.example.lms.service.BorrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrow")
@CrossOrigin(origins = "*")
public class BorrowController {
    
    @Autowired
    private BorrowService borrowService;
    
    @PostMapping("/issue")
    public ResponseEntity<BorrowRecord> issueBook(@RequestBody Map<String, String> request) {
        try {
            String memberID = request.get("memberID");
            String bookID = request.get("bookID");
            return ResponseEntity.ok(borrowService.issueBook(memberID, bookID));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/return/{recordId}")
    public ResponseEntity<?> returnBook(@PathVariable String recordId) {
        try {
            return ResponseEntity.ok(borrowService.returnBook(recordId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/member/{memberID}")
    public List<BorrowRecord> getMemberBorrowHistory(@PathVariable String memberID) {
        return borrowService.getMemberBorrowHistory(memberID);
    }
    
    @GetMapping("/active")
    public List<BorrowRecord> getActiveBorrows() {
        return borrowService.getActiveBorrows();
    }
    
    @GetMapping("/overdue")
    public List<BorrowRecord> getOverdueBooks() {
        return borrowService.getOverdueBooks();
    }
    
    @GetMapping("/pending")
    public List<BorrowRecord> getPendingRequests() {
        return borrowService.getPendingRequests();
    }
    
    @PostMapping("/approve/{recordId}")
    public ResponseEntity<?> approveBorrowRequest(@PathVariable String recordId) {
        try {
            return ResponseEntity.ok(borrowService.approveBorrowRequest(recordId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/reject/{recordId}")
    public ResponseEntity<?> rejectBorrowRequest(@PathVariable String recordId) {
        try {
            return ResponseEntity.ok(borrowService.rejectBorrowRequest(recordId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/invalid")
    public List<BorrowRecord> getInvalidBorrowRecords() {
        return borrowService.getInvalidBorrowRecords();
    }
    
    @DeleteMapping("/invalid/{recordId}")
    public ResponseEntity<?> deleteInvalidBorrowRecord(@PathVariable String recordId) {
        try {
            borrowService.deleteInvalidBorrowRecord(recordId);
            return ResponseEntity.ok(Map.of("message", "Invalid borrow record deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/cleanup-invalid")
    public ResponseEntity<?> cleanupAllInvalidRecords() {
        try {
            int count = borrowService.cleanupAllInvalidRecords();
            return ResponseEntity.ok(Map.of("message", "Cleanup completed", "deletedCount", count));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
