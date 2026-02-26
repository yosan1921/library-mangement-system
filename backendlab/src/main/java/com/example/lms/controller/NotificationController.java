package com.example.lms.controller;

import com.example.lms.model.Notification;
import com.example.lms.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    // Get all notifications
    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationService.getAllNotifications();
    }
    
    // Get notifications by member
    @GetMapping("/member/{memberId}")
    public List<Notification> getNotificationsByMember(@PathVariable String memberId) {
        return notificationService.getNotificationsByMember(memberId);
    }
    
    // Get notifications by status
    @GetMapping("/status/{status}")
    public List<Notification> getNotificationsByStatus(@PathVariable String status) {
        return notificationService.getNotificationsByStatus(status);
    }
    
    // Get notifications by category
    @GetMapping("/category/{category}")
    public List<Notification> getNotificationsByCategory(@PathVariable String category) {
        return notificationService.getNotificationsByCategory(category);
    }
    
    // Create custom notification
    @PostMapping("/custom")
    public ResponseEntity<Notification> createCustomNotification(@RequestBody Map<String, String> request) {
        try {
            String memberId = request.get("memberId");
            String subject = request.get("subject");
            String message = request.get("message");
            String category = request.get("category");
            
            Notification notification = notificationService.createCustomNotification(
                memberId, subject, message, category
            );
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Send a single notification
    @PostMapping("/send/{notificationId}")
    public ResponseEntity<Notification> sendNotification(@PathVariable String notificationId) {
        try {
            Notification notification = notificationService.sendNotification(notificationId);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Send bulk notifications
    @PostMapping("/send/bulk")
    public ResponseEntity<Map<String, Object>> sendBulkNotifications(@RequestBody List<String> notificationIds) {
        try {
            Map<String, Object> result = notificationService.sendBulkNotifications(notificationIds);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get notification statistics
    @GetMapping("/statistics")
    public Map<String, Object> getNotificationStatistics() {
        return notificationService.getNotificationStatistics();
    }
    
    // Delete notification
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable String notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to delete notification: " + e.getMessage()));
        }
    }
    
    // Delete old notifications
    @DeleteMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> deleteOldNotifications() {
        try {
            int count = notificationService.deleteOldNotifications();
            return ResponseEntity.ok(Map.of(
                "message", "Old notifications deleted successfully",
                "count", count
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to delete old notifications: " + e.getMessage()));
        }
    }
    
    // Test notification configuration
    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testNotificationConfiguration(@RequestBody Map<String, String> request) {
        try {
            String testEmail = request.get("email");
            String testPhone = request.get("phone");
            
            Map<String, Object> result = notificationService.testNotificationConfiguration(testEmail, testPhone);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to test configuration: " + e.getMessage()));
        }
    }
    
    // Trigger automatic notifications manually
    @PostMapping("/trigger-automatic")
    public ResponseEntity<Map<String, String>> triggerAutomaticNotifications() {
        try {
            notificationService.sendAutomaticNotifications();
            return ResponseEntity.ok(Map.of("message", "Automatic notifications triggered successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to trigger notifications: " + e.getMessage()));
        }
    }
}
