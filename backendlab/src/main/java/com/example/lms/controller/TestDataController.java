package com.example.lms.controller;

import com.example.lms.model.Member;
import com.example.lms.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * TestDataController - Creates test data for development and testing
 * 
 * This controller provides endpoints to create test members and other data
 * for development and testing purposes. Should be disabled in production.
 */
@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestDataController {
    
    @Autowired
    private MemberService memberService;
    
    /**
     * Create a test member for development/testing
     */
    @PostMapping("/create-test-member")
    public ResponseEntity<?> createTestMember() {
        try {
            // Check if test member already exists
            if (memberService.getAllMembers().stream()
                    .anyMatch(m -> "testmember".equals(m.getUsername()))) {
                return ResponseEntity.ok(Map.of(
                    "message", "Test member already exists",
                    "username", "testmember",
                    "password", "password123"
                ));
            }
            
            // Create test member
            Member testMember = new Member();
            testMember.setName("Test Member");
            testMember.setUsername("testmember");
            testMember.setEmail("test@member.com");
            testMember.setPassword("password123");
            testMember.setContact("1234567890");
            testMember.setActive(true);
            testMember.setRole("member");
            
            Member createdMember = memberService.registerMember(testMember);
            
            return ResponseEntity.ok(Map.of(
                "message", "Test member created successfully",
                "membershipID", createdMember.getMembershipID(),
                "username", createdMember.getUsername(),
                "password", "password123",
                "email", createdMember.getEmail()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get test credentials for development
     */
    @GetMapping("/credentials")
    public ResponseEntity<?> getTestCredentials() {
        return ResponseEntity.ok(Map.of(
            "testMember", Map.of(
                "username", "testmember",
                "password", "password123",
                "email", "test@member.com"
            ),
            "note", "Use POST /api/test/create-test-member to create the test member first"
        ));
    }
}