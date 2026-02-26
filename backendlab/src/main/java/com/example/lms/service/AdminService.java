package com.example.lms.service;

import com.example.lms.model.Admin;
import com.example.lms.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class AdminService {
    
    @Autowired
    private AdminRepository adminRepository;
    
    // Predefined permissions
    public static final List<String> ALL_PERMISSIONS = Arrays.asList(
        "MANAGE_BOOKS",
        "MANAGE_MEMBERS",
        "MANAGE_BORROWS",
        "MANAGE_RESERVATIONS",
        "MANAGE_FINES",
        "VIEW_REPORTS",
        "MANAGE_SETTINGS",
        "MANAGE_ADMINS"
    );
    
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }
    
    public List<Admin> getActiveAdmins() {
        return adminRepository.findByActive(true);
    }
    
    public Admin getAdminById(String id) {
        return adminRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Admin not found"));
    }
    
    public Admin getAdminByUsername(String username) {
        return adminRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Admin not found"));
    }
    
    public Admin createAdmin(Admin admin, String createdBy) {
        System.out.println("=== Creating Admin ===");
        System.out.println("Username: " + admin.getUsername());
        System.out.println("Email: " + admin.getEmail());
        System.out.println("Role: " + admin.getRole());
        System.out.println("Created by: " + createdBy);
        
        // Check if username already exists
        if (adminRepository.findByUsername(admin.getUsername()).isPresent()) {
            System.err.println("ERROR: Username already exists: " + admin.getUsername());
            throw new RuntimeException("Username already exists");
        }
        
        // Check if email already exists
        if (adminRepository.findByEmail(admin.getEmail()).isPresent()) {
            System.err.println("ERROR: Email already exists: " + admin.getEmail());
            throw new RuntimeException("Email already exists");
        }
        
        // Set default values
        admin.setCreatedDate(LocalDateTime.now());
        admin.setCreatedBy(createdBy);
        admin.setActive(true);
        
        // Set default permissions based on role
        if (admin.getPermissions() == null || admin.getPermissions().isEmpty()) {
            List<String> defaultPermissions = getDefaultPermissionsForRole(admin.getRole());
            admin.setPermissions(defaultPermissions);
            System.out.println("Set default permissions: " + defaultPermissions);
        }
        
        // In production, hash the password here
        // admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        
        try {
            Admin savedAdmin = adminRepository.save(admin);
            System.out.println("Admin created successfully with ID: " + savedAdmin.getId());
            return savedAdmin;
        } catch (Exception e) {
            System.err.println("ERROR saving admin: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save admin: " + e.getMessage());
        }
    }
    
    public Admin updateAdmin(String id, Admin updatedAdmin) {
        Admin existingAdmin = getAdminById(id);
        
        // Update fields
        if (updatedAdmin.getEmail() != null) {
            // Check if email is taken by another admin
            adminRepository.findByEmail(updatedAdmin.getEmail())
                .ifPresent(admin -> {
                    if (!admin.getId().equals(id)) {
                        throw new RuntimeException("Email already exists");
                    }
                });
            existingAdmin.setEmail(updatedAdmin.getEmail());
        }
        
        if (updatedAdmin.getFullName() != null) {
            existingAdmin.setFullName(updatedAdmin.getFullName());
        }
        
        if (updatedAdmin.getPhone() != null) {
            existingAdmin.setPhone(updatedAdmin.getPhone());
        }
        
        if (updatedAdmin.getRole() != null) {
            existingAdmin.setRole(updatedAdmin.getRole());
        }
        
        if (updatedAdmin.getPermissions() != null) {
            existingAdmin.setPermissions(updatedAdmin.getPermissions());
        }
        
        if (updatedAdmin.getActive() != null) {
            existingAdmin.setActive(updatedAdmin.getActive());
        }
        
        return adminRepository.save(existingAdmin);
    }
    
    public Admin updatePassword(String id, String oldPassword, String newPassword) {
        Admin admin = getAdminById(id);
        
        // In production, verify old password with hashed version
        if (!admin.getPassword().equals(oldPassword)) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // In production, hash the new password
        // admin.setPassword(passwordEncoder.encode(newPassword));
        admin.setPassword(newPassword);
        
        return adminRepository.save(admin);
    }
    
    public Admin updateProfile(String id, Admin profileData) {
        Admin admin = getAdminById(id);
        
        if (profileData.getEmail() != null) {
            adminRepository.findByEmail(profileData.getEmail())
                .ifPresent(existingAdmin -> {
                    if (!existingAdmin.getId().equals(id)) {
                        throw new RuntimeException("Email already exists");
                    }
                });
            admin.setEmail(profileData.getEmail());
        }
        
        if (profileData.getFullName() != null) {
            admin.setFullName(profileData.getFullName());
        }
        
        if (profileData.getPhone() != null) {
            admin.setPhone(profileData.getPhone());
        }
        
        return adminRepository.save(admin);
    }
    
    public void deleteAdmin(String id) {
        Admin admin = getAdminById(id);
        
        // Prevent deleting super admin
        if ("SUPER_ADMIN".equals(admin.getRole())) {
            throw new RuntimeException("Cannot delete super admin");
        }
        
        adminRepository.deleteById(id);
    }
    
    public Admin deactivateAdmin(String id) {
        Admin admin = getAdminById(id);
        
        if ("SUPER_ADMIN".equals(admin.getRole())) {
            throw new RuntimeException("Cannot deactivate super admin");
        }
        
        admin.setActive(false);
        return adminRepository.save(admin);
    }
    
    public Admin activateAdmin(String id) {
        Admin admin = getAdminById(id);
        admin.setActive(true);
        return adminRepository.save(admin);
    }
    
    public Admin updateLastLogin(String id) {
        Admin admin = getAdminById(id);
        admin.setLastLogin(LocalDateTime.now());
        return adminRepository.save(admin);
    }
    
    public List<String> getDefaultPermissionsForRole(String role) {
        switch (role) {
            case "SUPER_ADMIN":
                return ALL_PERMISSIONS;
            case "ADMIN":
                return Arrays.asList(
                    "MANAGE_BOOKS",
                    "MANAGE_MEMBERS",
                    "MANAGE_BORROWS",
                    "MANAGE_RESERVATIONS",
                    "MANAGE_FINES",
                    "VIEW_REPORTS"
                );
            case "LIBRARIAN":
                return Arrays.asList(
                    "MANAGE_BORROWS",
                    "MANAGE_RESERVATIONS",
                    "VIEW_REPORTS"
                );
            default:
                return Arrays.asList("VIEW_REPORTS");
        }
    }
    
    public void initializeDefaultAdmin() {
        // Create default super admin if no admins exist
        if (adminRepository.count() == 0) {
            Admin superAdmin = new Admin();
            superAdmin.setUsername("admin");
            superAdmin.setPassword("admin123"); // Change in production!
            superAdmin.setEmail("admin@library.com");
            superAdmin.setFullName("System Administrator");
            superAdmin.setRole("SUPER_ADMIN");
            superAdmin.setPermissions(ALL_PERMISSIONS);
            superAdmin.setCreatedBy("SYSTEM");
            adminRepository.save(superAdmin);
        }
    }
}
