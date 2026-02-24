package com.example.lms.service;

import com.example.lms.model.Admin;
import com.example.lms.model.Librarian;
import com.example.lms.model.Member;
import com.example.lms.repository.AdminRepository;
import com.example.lms.repository.LibrarianRepository;
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

    @Autowired
    private LibrarianRepository librarianRepository;

    public Map<String, Object> authenticate(String username, String password) {
        System.out.println("=== Authentication Attempt ===");
        System.out.println("Username: " + username);
        System.out.println("Password: " + password);
        
        try {
            // First, try to authenticate as Admin
            Admin admin = adminRepository.findByUsername(username).orElse(null);
            System.out.println("Admin found: " + (admin != null));
            
            if (admin != null) {
                System.out.println("Admin password in DB: " + admin.getPassword());
                System.out.println("Password matches: " + admin.getPassword().equals(password));
                System.out.println("Admin active: " + admin.getActive());
            }
            
            if (admin != null && admin.getPassword() != null && admin.getPassword().equals(password) && admin.getActive()) {
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
        } catch (Exception e) {
            System.out.println("Error checking admin: " + e.getMessage());
        }

        try {
            // Second, try to authenticate as Librarian
            Librarian librarian = librarianRepository.findByUsername(username).orElse(null);
            System.out.println("Librarian found: " + (librarian != null));
            
            if (librarian != null) {
                System.out.println("Librarian password in DB: " + librarian.getPassword());
                System.out.println("Password matches: " + librarian.getPassword().equals(password));
                System.out.println("Librarian active: " + librarian.isActive());
            }
            
            if (librarian != null && librarian.getPassword() != null && librarian.getPassword().equals(password) && librarian.isActive()) {
                Map<String, Object> response = new HashMap<>();
                response.put("id", librarian.getId());
                response.put("username", librarian.getUsername());
                response.put("fullName", librarian.getName());
                response.put("email", librarian.getEmail());
                response.put("role", "librarian");
                response.put("permissions", java.util.Arrays.asList("MANAGE_BOOKS", "MANAGE_BORROWS"));
                System.out.println("Librarian authentication successful!");
                return response;
            }
        } catch (Exception e) {
            System.out.println("Error checking librarian: " + e.getMessage());
        }

        try {
            // If not admin or librarian, try to authenticate as Member
            Member member = memberRepository.findByUsername(username).orElse(null);
            System.out.println("Member found: " + (member != null));
            
            if (member != null) {
                System.out.println("Member password in DB: " + member.getPassword());
                System.out.println("Password matches: " + (member.getPassword() != null && member.getPassword().equals(password)));
                System.out.println("Member active: " + member.getActive());
            }
            
            if (member != null && member.getPassword() != null && member.getPassword().equals(password) && member.getActive()) {
                Map<String, Object> response = new HashMap<>();
                response.put("id", member.getId());
                response.put("username", member.getUsername());
                response.put("fullName", member.getName());
                response.put("email", member.getEmail());
                response.put("contact", member.getContact());
                response.put("role", "member");
                System.out.println("Member authentication successful!");
                return response;
            }
        } catch (Exception e) {
            System.out.println("Error checking member: " + e.getMessage());
        }

        System.out.println("Authentication failed!");
        return null;
    }
}
