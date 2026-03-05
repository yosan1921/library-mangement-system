package com.example.lms.controller;

import com.example.lms.model.Admin;
import com.example.lms.service.AdminService;
import com.example.lms.service.ProfilePhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private ProfilePhotoService profilePhotoService;
    
    @GetMapping
    public List<Admin> getAllAdmins() {
        return adminService.getAllAdmins();
    }
    
    @GetMapping("/active")
    public List<Admin> getActiveAdmins() {
        return adminService.getActiveAdmins();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Admin> getAdminById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(adminService.getAdminById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/username/{username}")
    public ResponseEntity<Admin> getAdminByUsername(@PathVariable String username) {
        try {
            return ResponseEntity.ok(adminService.getAdminByUsername(username));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createAdmin(@RequestBody Admin admin, 
                                         @RequestParam(defaultValue = "admin") String createdBy) {
        try {
            Admin createdAdmin = adminService.createAdmin(admin, createdBy);
            return ResponseEntity.ok(createdAdmin);
        } catch (RuntimeException e) {
            System.err.println("Error creating admin: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable String id, @RequestBody Admin admin) {
        try {
            Admin updatedAdmin = adminService.updateAdmin(id, admin);
            return ResponseEntity.ok(updatedAdmin);
        } catch (RuntimeException e) {
            System.err.println("Error updating admin: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable String id, @RequestBody Map<String, String> passwords) {
        try {
            String oldPassword = passwords.get("oldPassword");
            String newPassword = passwords.get("newPassword");
            Admin updatedAdmin = adminService.updatePassword(id, oldPassword, newPassword);
            return ResponseEntity.ok(updatedAdmin);
        } catch (RuntimeException e) {
            System.err.println("Error updating password: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable String id, @RequestBody Admin profileData) {
        try {
            Admin updatedAdmin = adminService.updateProfile(id, profileData);
            return ResponseEntity.ok(updatedAdmin);
        } catch (RuntimeException e) {
            System.err.println("Error updating profile: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable String id) {
        try {
            adminService.deleteAdmin(id);
            return ResponseEntity.ok().body(Map.of("message", "Admin deleted successfully"));
        } catch (RuntimeException e) {
            System.err.println("Error deleting admin: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateAdmin(@PathVariable String id) {
        try {
            Admin deactivatedAdmin = adminService.deactivateAdmin(id);
            return ResponseEntity.ok(deactivatedAdmin);
        } catch (RuntimeException e) {
            System.err.println("Error deactivating admin: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activateAdmin(@PathVariable String id) {
        try {
            Admin activatedAdmin = adminService.activateAdmin(id);
            return ResponseEntity.ok(activatedAdmin);
        } catch (RuntimeException e) {
            System.err.println("Error activating admin: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/permissions")
    public List<String> getAllPermissions() {
        return AdminService.ALL_PERMISSIONS;
    }
    
    @GetMapping("/permissions/role/{role}")
    public List<String> getDefaultPermissionsForRole(@PathVariable String role) {
        return adminService.getDefaultPermissionsForRole(role);
    }
    
    @PostMapping("/initialize")
    public ResponseEntity<Map<String, String>> initializeDefaultAdmin() {
        adminService.initializeDefaultAdmin();
        return ResponseEntity.ok(Map.of("message", "Default admin initialized"));
    }
    
    /**
     * Upload profile photo using Base64 storage
     */
    @PostMapping("/{id}/profile-photo")
    public ResponseEntity<?> uploadProfilePhoto(@PathVariable String id, 
                                                @RequestParam("photo") MultipartFile file) {
        System.out.println("=== AdminController.uploadProfilePhoto ===");
        System.out.println("Admin ID: " + id);
        System.out.println("File received: " + (file != null ? file.getOriginalFilename() : "null"));
        
        try {
            Admin updatedAdmin = profilePhotoService.updateProfilePhoto(id, file);
            System.out.println("Photo upload successful for admin: " + updatedAdmin.getUsername());
            
            return ResponseEntity.ok(Map.of(
                "message", "Profile photo uploaded successfully",
                "admin", updatedAdmin
            ));
        } catch (IOException e) {
            System.err.println("Error uploading profile photo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload photo: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid file: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            System.err.println("Error finding admin: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get profile photo data
     */
    @GetMapping("/{id}/profile-photo")
    public ResponseEntity<?> getProfilePhoto(@PathVariable String id) {
        System.out.println("=== AdminController.getProfilePhoto ===");
        System.out.println("Admin ID: " + id);
        
        try {
            String photoData = profilePhotoService.getProfilePhoto(id);
            
            if (photoData == null) {
                System.out.println("No photo found for admin: " + id);
                return ResponseEntity.ok(Map.of("hasPhoto", false));
            }
            
            System.out.println("Photo found for admin: " + id + " (length: " + photoData.length() + ")");
            return ResponseEntity.ok(Map.of(
                "hasPhoto", true,
                "photoData", photoData
            ));
            
        } catch (RuntimeException e) {
            System.err.println("Error getting profile photo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete profile photo
     */
    @DeleteMapping("/{id}/profile-photo")
    public ResponseEntity<?> deleteProfilePhoto(@PathVariable String id) {
        try {
            Admin updatedAdmin = profilePhotoService.removeProfilePhoto(id);
            return ResponseEntity.ok(Map.of(
                "message", "Profile photo deleted successfully",
                "admin", updatedAdmin
            ));
        } catch (RuntimeException e) {
            System.err.println("Error deleting profile photo: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Direct test endpoint - bypasses service layer
     */
    @PostMapping("/{id}/test-direct-photo")
    public ResponseEntity<?> testDirectPhoto(@PathVariable String id, 
                                           @RequestParam("photo") MultipartFile file) {
        System.out.println("=== DIRECT TEST - AdminController.testDirectPhoto ===");
        
        try {
            // Get admin directly
            Admin admin = adminService.getAdminById(id);
            System.out.println("Found admin: " + admin.getUsername());
            
            // Convert to Base64 directly
            byte[] fileBytes = file.getBytes();
            String base64Photo = java.util.Base64.getEncoder().encodeToString(fileBytes);
            String photoData = "data:" + file.getContentType() + ";base64," + base64Photo;
            
            System.out.println("Created photo data, length: " + photoData.length());
            
            // Set and save directly
            admin.setProfilePhoto(photoData);
            Admin savedAdmin = adminService.updateAdmin(id, admin);
            
            System.out.println("Saved admin. Photo field length: " + 
                              (savedAdmin.getProfilePhoto() != null ? savedAdmin.getProfilePhoto().length() : "null"));
            
            // Immediately verify by re-fetching
            Admin verifyAdmin = adminService.getAdminById(id);
            System.out.println("Verification - Photo field length: " + 
                              (verifyAdmin.getProfilePhoto() != null ? verifyAdmin.getProfilePhoto().length() : "null"));
            
            return ResponseEntity.ok(Map.of(
                "message", "Direct photo test successful",
                "photoLength", photoData.length(),
                "savedPhotoLength", savedAdmin.getProfilePhoto() != null ? savedAdmin.getProfilePhoto().length() : 0,
                "verifiedPhotoLength", verifyAdmin.getProfilePhoto() != null ? verifyAdmin.getProfilePhoto().length() : 0
            ));
            
        } catch (Exception e) {
            System.err.println("Direct test failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
