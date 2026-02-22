package com.example.lms.controller;

import com.example.lms.model.Member;
import com.example.lms.model.BorrowRecord;
import com.example.lms.service.MemberService;
import com.example.lms.service.BorrowService;
import com.example.lms.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {
    
    @Autowired
    private MemberService memberService;
    
    @Autowired
    private BorrowService borrowService;
    
    @Autowired
    private BookService bookService;
    
    // Step 1: Member Registration
    @PostMapping("/register")
    public ResponseEntity<?> registerMember(@RequestBody Member member) {
        try {
            Member registered = memberService.registerMember(member);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful");
            response.put("membershipID", registered.getMembershipID());
            response.put("member", registered);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    // Step 2: Member Login (handled by AuthController, but we can add a specific endpoint)
    @PostMapping("/login")
    public ResponseEntity<?> loginMember(@RequestBody Map<String, String> credentials) {
        try {
            Map<String, Object> result = memberService.authenticateMember(
                credentials.get("email"), 
                credentials.get("password")
            );
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    // Step 3: Search Books
    @GetMapping("/search")
    public ResponseEntity<?> searchBooks(
        @RequestParam(required = false) String title,
        @RequestParam(required = false) String author,
        @RequestParam(required = false) String category
    ) {
        try {
            List<?> results = memberService.searchBooks(title, author, category);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error searching books: " + e.getMessage()));
        }
    }
    
    // Step 4: Borrow Book
    @PostMapping("/borrow/{bookId}")
    public ResponseEntity<?> borrowBook(
        @PathVariable String bookId,
        @RequestParam String memberId
    ) {
        try {
            BorrowRecord record = memberService.borrowBook(memberId, bookId);
            return ResponseEntity.status(HttpStatus.CREATED).body(record);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    // Step 5: Return Book
    @PostMapping("/return/{borrowId}")
    public ResponseEntity<?> returnBook(@PathVariable String borrowId) {
        try {
            Map<String, Object> result = memberService.returnBook(borrowId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    // Step 6: View History
    @GetMapping("/history/{memberId}")
    public ResponseEntity<?> getMemberHistory(@PathVariable String memberId) {
        try {
            List<BorrowRecord> history = memberService.getMemberHistory(memberId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error fetching history: " + e.getMessage()));
        }
    }
    
    // Step 6: View Notifications
    @GetMapping("/notifications/{memberId}")
    public ResponseEntity<?> getMemberNotifications(@PathVariable String memberId) {
        try {
            List<Map<String, Object>> notifications = memberService.getMemberNotifications(memberId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error fetching notifications: " + e.getMessage()));
        }
    }
    
    // Admin endpoints
    @GetMapping
    public List<Member> getAllMembers() {
        return memberService.getAllMembers();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable String id) {
        return memberService.getMemberById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public Member addMember(@RequestBody Member member) {
        return memberService.addMember(member);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable String id, @RequestBody Member member) {
        try {
            return ResponseEntity.ok(memberService.updateMember(id, member));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable String id) {
        memberService.deleteMember(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/active")
    public List<Member> getActiveMembers() {
        return memberService.getActiveMembers();
    }
}
