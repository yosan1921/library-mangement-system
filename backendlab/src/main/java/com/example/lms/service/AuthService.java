package com.example.lms.service;

import com.example.lms.model.Admin;
import com.example.lms.model.Member;
import com.example.lms.repository.AdminRepository;
import com.example.lms.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private MemberRepository memberRepository;

    public Map<String, Object> authenticate(String username, String password) {
        System.out.println("=== Authentication Attempt ===");
        System.out.println("Username: " + username);
        System.out.println("Password: " + password);
        
        // First, try to authenticate as Admin
        Admin admin = adminRepository.findByUsername(username).orElse(null);
        System.out.println("Admin found: " + (admin != null));
        
        if (admin != null) {
            System.out.println("Admin password in DB: " + admin.getPassword());
            System.out.println("Password matches: " + admin.getPassword().equals(password));
            System.out.println("Admin active: " + admin.getActive());
        }
        
        if (admin != null && admin.getPassword().equals(password) && admin.getActive()) {
            // Update last login
            admin.setLastLogin(LocalDateTime.now());
            adminRepository.save(admin);

            Map<String, Object> response = new HashMap<>();
            response.put("id", admin.getId());
            response.put("username", admin.getUsername());
            response.put("fullName", admin.getFullName());
            response.put("email", admin.getEmail());
            response.put("role", admin.getRole().toLowerCase());
            response.put("permissions", admin.getPermissions());
            System.out.println("Authentication successful!");
            return response;
        }

        // If not admin, try to authenticate as Member
        Member member = memberRepository.findByMembershipID(username).orElse(null);
        if (member != null && member.getActive()) {
            // For members, we'll use membershipID as username
            // In a real system, you'd have a password field for members too
            Map<String, Object> response = new HashMap<>();
            response.put("id", member.getId());
            response.put("username", member.getMembershipID());
            response.put("fullName", member.getName());
            response.put("contact", member.getContact());
            response.put("role", "member");
            System.out.println("Member authentication successful!");
            return response;
        }

        System.out.println("Authentication failed!");
        return null;
    }
}
