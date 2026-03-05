package com.example.lms.controller;

import com.example.lms.model.Member;
import com.example.lms.model.BorrowRecord;
import com.example.lms.model.Fine;
import com.example.lms.model.Reservation;
import com.example.lms.model.Notification;
import com.example.lms.service.MemberService;
import com.example.lms.service.BorrowService;
import com.example.lms.service.FineService;
import com.example.lms.service.ReservationService;
import com.example.lms.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

/**
 * MemberController - REST endpoints for member-specific operations
 * 
 * This controller handles member authentication, registration, and provides
 * member-specific data access for the member dashboard and portal.
 * 
 * Key Features:
 * - Member registration and authentication
 * - Member-specific data retrieval (borrows, fines, reservations, notifications)
 * - Dashboard statistics and summaries
 * - Member profile management
 */
@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {
    
    @Autowired
    private MemberService memberService;
    
    @Autowired
    private BorrowService borrowService;
    
    @Autowired
    private FineService fineService;
    
    @Autowired(required = false)
    private ReservationService reservationService;
    
    @Autowired(required = false)
    private NotificationService notificationService;
    
    /**
     * Member Registration
     * Extends the existing Add Member functionality with authentication fields
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerMember(@RequestBody Member member) {
        try {
            // Validate required fields for registration
            if (member.getUsername() == null || member.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
            }
            if (member.getPassword() == null || member.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
            }
            if (member.getPassword().length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
            }
            
            Member registeredMember = memberService.registerMember(member);
            
            // Return registration success with membership ID
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Registration successful");
            response.put("membershipID", registeredMember.getMembershipID());
            response.put("username", registeredMember.getUsername());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Member Authentication
     * Authenticates member using username/email and password
     */
    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticateMember(@RequestBody Map<String, String> credentials) {
        try {
            String usernameOrEmail = credentials.get("username");
            String password = credentials.get("password");
            
            if (usernameOrEmail == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required"));
            }
            
            Map<String, Object> authResult = memberService.authenticateMember(usernameOrEmail, password);
            return ResponseEntity.ok(authResult);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get Member Profile
     * Returns member information for the logged-in member
     */
    @GetMapping("/{memberId}/profile")
    public ResponseEntity<?> getMemberProfile(@PathVariable String memberId) {
        try {
            Optional<Member> optMember = memberService.getMemberById(memberId);
            if (!optMember.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Member member = optMember.get();
            
            // Return safe member data (no password)
            Map<String, Object> profile = new HashMap<>();
            profile.put("id", member.getId());
            profile.put("name", member.getName());
            profile.put("username", member.getUsername());
            profile.put("email", member.getEmail());
            profile.put("contact", member.getContact());
            profile.put("membershipID", member.getMembershipID());
            profile.put("active", member.getActive());
            profile.put("createdAt", member.getCreatedAt());
            
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get Member Dashboard Data
     * Returns comprehensive dashboard information for a member
     */
    @GetMapping("/{memberId}/dashboard")
    public ResponseEntity<?> getMemberDashboard(@PathVariable String memberId) {
        try {
            // Verify member exists
            Optional<Member> optMember = memberService.getMemberById(memberId);
            if (!optMember.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            // Get member's borrow records
            List<BorrowRecord> allBorrows = borrowService.getMemberBorrowHistory(memberId);
            List<BorrowRecord> activeBorrows = allBorrows.stream()
                .filter(record -> "APPROVED".equals(record.getStatus()) && record.getReturnDate() == null)
                .collect(java.util.stream.Collectors.toList());
            
            // Get member's fines
            List<Fine> allFines = fineService.getMemberFines(memberId);
            List<Fine> unpaidFines = allFines.stream()
                .filter(fine -> "UNPAID".equals(fine.getStatus()) || "PARTIALLY_PAID".equals(fine.getStatus()))
                .collect(java.util.stream.Collectors.toList());
            
            Double totalOutstanding = fineService.getMemberTotalOutstanding(memberId);
            
            // Get member's reservations (if service available)
            List<Reservation> activeReservations = new java.util.ArrayList<>();
            if (reservationService != null) {
                try {
                    activeReservations = reservationService.getMemberReservations(memberId).stream()
                        .filter(res -> "PENDING".equals(res.getStatus()) || "APPROVED".equals(res.getStatus()))
                        .collect(java.util.stream.Collectors.toList());
                } catch (Exception e) {
                    System.err.println("Error getting reservations: " + e.getMessage());
                }
            }
            
            // Get member's notifications (if service available)
            List<Notification> recentNotifications = new java.util.ArrayList<>();
            if (notificationService != null) {
                try {
                    recentNotifications = notificationService.getNotificationsByMember(memberId).stream()
                        .limit(5)
                        .collect(java.util.stream.Collectors.toList());
                } catch (Exception e) {
                    System.err.println("Error getting notifications: " + e.getMessage());
                }
            }
            
            // Build dashboard response
            Map<String, Object> dashboard = new HashMap<>();
            
            // Statistics
            Map<String, Object> stats = new HashMap<>();
            stats.put("activeBorrows", activeBorrows.size());
            stats.put("totalBorrowed", allBorrows.size());
            stats.put("unpaidFines", unpaidFines.size());
            stats.put("totalOutstanding", totalOutstanding);
            stats.put("activeReservations", activeReservations.size());
            
            dashboard.put("stats", stats);
            dashboard.put("activeBorrows", activeBorrows.stream().limit(5).collect(java.util.stream.Collectors.toList()));
            dashboard.put("unpaidFines", unpaidFines.stream().limit(5).collect(java.util.stream.Collectors.toList()));
            dashboard.put("activeReservations", activeReservations.stream().limit(5).collect(java.util.stream.Collectors.toList()));
            dashboard.put("recentNotifications", recentNotifications);
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get Member's Borrow Records
     */
    @GetMapping("/{memberId}/borrows")
    public ResponseEntity<List<BorrowRecord>> getMemberBorrows(@PathVariable String memberId) {
        try {
            List<BorrowRecord> borrows = borrowService.getMemberBorrowHistory(memberId);
            return ResponseEntity.ok(borrows);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get Member's Active Borrows
     */
    @GetMapping("/{memberId}/borrows/active")
    public ResponseEntity<List<BorrowRecord>> getMemberActiveBorrows(@PathVariable String memberId) {
        try {
            List<BorrowRecord> allBorrows = borrowService.getMemberBorrowHistory(memberId);
            List<BorrowRecord> activeBorrows = allBorrows.stream()
                .filter(record -> "APPROVED".equals(record.getStatus()) && record.getReturnDate() == null)
                .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(activeBorrows);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get Member's Fines
     */
    @GetMapping("/{memberId}/fines")
    public ResponseEntity<List<Fine>> getMemberFines(@PathVariable String memberId) {
        try {
            List<Fine> fines = fineService.getMemberFines(memberId);
            return ResponseEntity.ok(fines);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get Member's Outstanding Fine Amount
     */
    @GetMapping("/{memberId}/fines/outstanding")
    public ResponseEntity<Map<String, Double>> getMemberOutstandingFines(@PathVariable String memberId) {
        try {
            Double outstanding = fineService.getMemberTotalOutstanding(memberId);
            return ResponseEntity.ok(Map.of("outstanding", outstanding));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get Member's Reservations
     */
    @GetMapping("/{memberId}/reservations")
    public ResponseEntity<List<Reservation>> getMemberReservations(@PathVariable String memberId) {
        try {
            if (reservationService == null) {
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            List<Reservation> reservations = reservationService.getMemberReservations(memberId);
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get Member's Notifications
     */
    @GetMapping("/{memberId}/notifications")
    public ResponseEntity<List<Notification>> getMemberNotifications(@PathVariable String memberId) {
        try {
            if (notificationService == null) {
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            List<Notification> notifications = notificationService.getNotificationsByMember(memberId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update Member Profile
     */
    @PutMapping("/{memberId}/profile")
    public ResponseEntity<?> updateMemberProfile(@PathVariable String memberId, @RequestBody Member memberDetails) {
        try {
            // Don't allow password updates through this endpoint
            memberDetails.setPassword(null);
            
            Member updatedMember = memberService.updateMember(memberId, memberDetails);
            
            // Return safe member data (no password)
            Map<String, Object> profile = new HashMap<>();
            profile.put("id", updatedMember.getId());
            profile.put("name", updatedMember.getName());
            profile.put("username", updatedMember.getUsername());
            profile.put("email", updatedMember.getEmail());
            profile.put("contact", updatedMember.getContact());
            profile.put("membershipID", updatedMember.getMembershipID());
            
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // ========== EXISTING ADMIN ENDPOINTS (UNCHANGED) ==========
    
    @GetMapping
    public List<Member> getAllMembers() {
        return memberService.getAllMembers();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable String id) {
        Optional<Member> member = memberService.getMemberById(id);
        return member.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Member> addMember(@RequestBody Member member) {
        try {
            return ResponseEntity.ok(memberService.addMember(member));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable String id, @RequestBody Member memberDetails) {
        try {
            return ResponseEntity.ok(memberService.updateMember(id, memberDetails));
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
    
    @GetMapping("/membership/{membershipID}")
    public ResponseEntity<Member> getMemberByMembershipID(@PathVariable String membershipID) {
        Optional<Member> member = memberService.getMemberByMembershipID(membershipID);
        return member.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}