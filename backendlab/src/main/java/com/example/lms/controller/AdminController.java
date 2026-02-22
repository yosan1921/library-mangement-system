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
    public ResponseEntity<Admin> createAdmin(@RequestBody Admin admin, 
                                             @RequestParam(defaultValue = "admin") String createdBy) {
        try {
            return ResponseEntity.ok(adminService.createAdmin(admin, createdBy));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Admin> updateAdmin(@PathVariable String id, @RequestBody Admin admin) {
        try {
            return ResponseEntity.ok(adminService.updateAdmin(id, admin));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/password")
    public ResponseEntity<Admin> updatePassword(@PathVariable String id, @RequestBody Map<String, String> passwords) {
        try {
            String oldPassword = passwords.get("oldPassword");
            String newPassword = passwords.get("newPassword");
            return ResponseEntity.ok(adminService.updatePassword(id, oldPassword, newPassword));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/profile")
    public ResponseEntity<Admin> updateProfile(@PathVariable String id, @RequestBody Admin profileData) {
        try {
            return ResponseEntity.ok(adminService.updateProfile(id, profileData));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable String id) {
        try {
            adminService.deleteAdmin(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<Admin> deactivateAdmin(@PathVariable String id) {
        try {
            return ResponseEntity.ok(adminService.deactivateAdmin(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/activate")
    public ResponseEntity<Admin> activateAdmin(@PathVariable String id) {
        try {
            return ResponseEntity.ok(adminService.activateAdmin(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
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
