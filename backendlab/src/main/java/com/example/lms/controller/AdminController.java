package com.example.lms.controller;

import com.example.lms.model.Admin;
import com.example.lms.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
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
}
