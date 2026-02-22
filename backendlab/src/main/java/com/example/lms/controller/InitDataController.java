package com.example.lms.controller;

import com.example.lms.model.Admin;
import com.example.lms.model.Member;
import com.example.lms.repository.AdminRepository;
import com.example.lms.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/init")
@CrossOrigin(origins = "*")
public class InitDataController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private MemberRepository memberRepository;

    @GetMapping("/test-data")
    public ResponseEntity<?> initializeTestDataGet() {
        return initializeTestData();
    }

    @GetMapping("/check-users")
    public ResponseEntity<?> checkUsers() {
        Map<String, Object> result = new HashMap<>();
        
        // Check admin
        var adminOpt = adminRepository.findByUsername("admin");
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            Map<String, Object> adminInfo = new HashMap<>();
            adminInfo.put("username", admin.getUsername());
            adminInfo.put("password", admin.getPassword());
            adminInfo.put("active", admin.getActive());
            adminInfo.put("role", admin.getRole());
            result.put("admin", adminInfo);
        } else {
            result.put("admin", "Not found");
        }
        
        // Check all admins count
        result.put("totalAdmins", adminRepository.count());
        result.put("totalMembers", memberRepository.count());
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/test-data")
    public ResponseEntity<?> initializeTestData() {
        Map<String, Object> result = new HashMap<>();

        // Create test admin if not exists
        if (!adminRepository.findByUsername("admin").isPresent()) {
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword("admin123");
            admin.setEmail("admin@library.com");
            admin.setFullName("System Administrator");
            admin.setPhone("1234567890");
            admin.setRole("ADMIN");
            admin.setPermissions(Arrays.asList("ALL"));
            admin.setActive(true);
            admin.setCreatedDate(LocalDateTime.now());
            adminRepository.save(admin);
            result.put("admin", "Created test admin: username=admin, password=admin123");
        } else {
            result.put("admin", "Admin already exists");
        }

        // Create test librarian if not exists
        if (!adminRepository.findByUsername("librarian").isPresent()) {
            Admin librarian = new Admin();
            librarian.setUsername("librarian");
            librarian.setPassword("lib123");
            librarian.setEmail("librarian@library.com");
            librarian.setFullName("Library Staff");
            librarian.setPhone("0987654321");
            librarian.setRole("LIBRARIAN");
            librarian.setPermissions(Arrays.asList("MANAGE_BOOKS", "MANAGE_BORROWS"));
            librarian.setActive(true);
            librarian.setCreatedDate(LocalDateTime.now());
            adminRepository.save(librarian);
            result.put("librarian", "Created test librarian: username=librarian, password=lib123");
        } else {
            result.put("librarian", "Librarian already exists");
        }

        // Create test member if not exists
        if (!memberRepository.findByMembershipID("M001").isPresent()) {
            Member member = new Member();
            member.setMembershipID("M001");
            member.setName("John Doe");
            member.setContact("john@example.com");
            member.setActive(true);
            member.setRole("MEMBER");
            memberRepository.save(member);
            result.put("member", "Created test member: membershipID=M001");
        } else {
            result.put("member", "Member already exists");
        }

        return ResponseEntity.ok(result);
    }
}
