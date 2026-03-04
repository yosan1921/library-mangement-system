package com.example.lms.controller;

import com.example.lms.model.Admin;
import com.example.lms.model.Librarian;
import com.example.lms.model.Member;
import com.example.lms.model.SystemSettings;
import com.example.lms.repository.AdminRepository;
import com.example.lms.repository.LibrarianRepository;
import com.example.lms.repository.MemberRepository;
import com.example.lms.service.SystemSettingsService;
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

    @Autowired
    private LibrarianRepository librarianRepository;

    @Autowired
    private SystemSettingsService systemSettingsService;

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

        // Create test super admin if not exists
        if (!adminRepository.findByUsername("admin").isPresent()) {
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword("admin123");
            admin.setEmail("admin@library.com");
            admin.setFullName("System Administrator");
            admin.setPhone("1234567890");
            admin.setRole("SUPER_ADMIN");
            admin.setPermissions(Arrays.asList(
                "MANAGE_BOOKS",
                "MANAGE_MEMBERS",
                "MANAGE_BORROWS",
                "MANAGE_RESERVATIONS",
                "MANAGE_FINES",
                "VIEW_REPORTS",
                "MANAGE_SETTINGS",
                "MANAGE_ADMINS"
            ));
            admin.setActive(true);
            admin.setCreatedDate(LocalDateTime.now());
            admin.setCreatedBy("SYSTEM");
            adminRepository.save(admin);
            result.put("admin", "Created test admin: username=admin, password=admin123, role=SUPER_ADMIN");
        } else {
            result.put("admin", "Admin already exists");
        }

        // Create test librarian in librarians collection if not exists
        if (!librarianRepository.findByUsername("librarian").isPresent()) {
            Librarian librarian = new Librarian();
            librarian.setUsername("librarian");
            librarian.setPassword("lib123");
            librarian.setEmail("librarian@library.com");
            librarian.setName("Library Staff");
            librarian.setPhone("0987654321");
            librarian.setActive(true);
            librarian.setCreatedAt(new java.util.Date());
            librarian.setUpdatedAt(new java.util.Date());
            librarianRepository.save(librarian);
            result.put("librarian", "Created test librarian: username=librarian, password=lib123");
        } else {
            result.put("librarian", "Librarian already exists");
        }

        // Create test member if not exists
        if (!memberRepository.findByUsername("member").isPresent()) {
            Member member = new Member();
            member.setUsername("member");
            member.setPassword("mem123");
            member.setMembershipID("M001");
            member.setName("John Doe");
            member.setEmail("member@library.com");
            member.setContact("john@example.com");
            member.setActive(true);
            member.setRole("MEMBER");
            memberRepository.save(member);
            result.put("member", "Created test member: username=member, password=mem123");
        } else {
            result.put("member", "Member already exists");
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/notification-system")
    public ResponseEntity<?> initializeNotificationSystem() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Get current system settings
            SystemSettings settings = systemSettingsService.getSettings();
            
            // Enable notifications with basic configuration
            settings.setEmailNotificationsEnabled(true);
            settings.setSmsNotificationsEnabled(false); // Keep SMS disabled for now
            settings.setDueDateReminderDays(2);
            settings.setOverdueReminderDays(1);
            
            // Set basic email configuration (can be updated later via settings)
            if (settings.getEmailHost() == null) {
                settings.setEmailHost("smtp.gmail.com");
            }
            if (settings.getEmailPort() == null) {
                settings.setEmailPort(587);
            }
            if (settings.getLibraryName() == null) {
                settings.setLibraryName("Library Management System");
            }
            if (settings.getLibraryEmail() == null) {
                settings.setLibraryEmail("library@example.com");
            }
            
            // Save updated settings
            systemSettingsService.updateSettings(settings, "SYSTEM");
            
            result.put("status", "success");
            result.put("message", "Notification system initialized successfully");
            result.put("emailEnabled", settings.getEmailNotificationsEnabled());
            result.put("smsEnabled", settings.getSmsNotificationsEnabled());
            result.put("dueDateReminderDays", settings.getDueDateReminderDays());
            result.put("overdueReminderDays", settings.getOverdueReminderDays());
            
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", "Failed to initialize notification system: " + e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/fix-notifications")
    public ResponseEntity<?> fixNotificationIssues() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. Enable email notifications in system settings
            SystemSettings settings = systemSettingsService.getSettings();
            settings.setEmailNotificationsEnabled(true);
            settings.setSmsNotificationsEnabled(false);
            
            // Set basic email configuration if missing
            if (settings.getEmailHost() == null) {
                settings.setEmailHost("smtp.gmail.com");
            }
            if (settings.getEmailPort() == null) {
                settings.setEmailPort(587);
            }
            if (settings.getEmailUsername() == null || settings.getEmailUsername().isEmpty()) {
                settings.setEmailUsername("your-email@gmail.com");
            }
            if (settings.getEmailPassword() == null || settings.getEmailPassword().isEmpty()) {
                settings.setEmailPassword("your-app-password");
            }
            if (settings.getLibraryName() == null) {
                settings.setLibraryName("Library Management System");
            }
            if (settings.getLibraryEmail() == null) {
                settings.setLibraryEmail("library@example.com");
            }
            
            systemSettingsService.updateSettings(settings, "SYSTEM");
            result.put("systemSettings", "Email notifications enabled and configured");
            
            // 2. Fix member email addresses
            int membersFixed = 0;
            var allMembers = memberRepository.findAll();
            for (Member member : allMembers) {
                if (member.getEmail() == null || member.getEmail().isEmpty() || !isValidEmail(member.getEmail())) {
                    // Generate a valid email based on username
                    String validEmail = member.getUsername() + "@library.com";
                    member.setEmail(validEmail);
                    memberRepository.save(member);
                    membersFixed++;
                }
            }
            result.put("membersFixed", membersFixed + " members now have valid email addresses");
            
            // 3. Fix admin email addresses
            int adminsFixed = 0;
            var allAdmins = adminRepository.findAll();
            for (Admin admin : allAdmins) {
                if (admin.getEmail() == null || admin.getEmail().isEmpty() || !isValidEmail(admin.getEmail())) {
                    String validEmail = admin.getUsername() + "@library.com";
                    admin.setEmail(validEmail);
                    adminRepository.save(admin);
                    adminsFixed++;
                }
            }
            result.put("adminsFixed", adminsFixed + " admins now have valid email addresses");
            
            result.put("status", "success");
            result.put("message", "Notification issues fixed successfully");
            result.put("nextStep", "Update email credentials in system settings for actual email sending");
            
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", "Failed to fix notification issues: " + e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }

    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        // Robust email regex pattern that accepts Gmail and other common formats
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email.matches(emailRegex);
    }
}
