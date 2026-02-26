package com.example.lms.service;

import com.example.lms.model.*;
import com.example.lms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import javax.mail.*;
import javax.mail.internet.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private SystemSettingsRepository settingsRepository;
    
    @Autowired
    private BorrowRecordRepository borrowRecordRepository;
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private FineRepository fineRepository;
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    // Create a notification
    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }
    
    // Get all notifications
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }
    
    // Get notifications by member
    public List<Notification> getNotificationsByMember(String memberId) {
        return notificationRepository.findByMemberId(memberId);
    }
    
    // Get notifications by status
    public List<Notification> getNotificationsByStatus(String status) {
        return notificationRepository.findByStatus(status);
    }
    
    // Get notifications by category
    public List<Notification> getNotificationsByCategory(String category) {
        return notificationRepository.findByCategory(category);
    }
    
    // Send a single notification
    public Notification sendNotification(String notificationId) {
        Optional<Notification> optNotification = notificationRepository.findById(notificationId);
        if (!optNotification.isPresent()) {
            throw new RuntimeException("Notification not found");
        }
        
        Notification notification = optNotification.get();
        SystemSettings settings = getSystemSettings();
        
        boolean success = false;
        String errorMsg = null;
        
        try {
            if ("EMAIL".equals(notification.getType()) || "BOTH".equals(notification.getType())) {
                if (settings.getEmailNotificationsEnabled()) {
                    sendEmail(notification, settings);
                    success = true;
                }
            }
            
            if ("SMS".equals(notification.getType()) || "BOTH".equals(notification.getType())) {
                if (settings.getSmsNotificationsEnabled()) {
                    sendSMS(notification, settings);
                    success = true;
                }
            }
            
            if (success) {
                notification.setStatus("SENT");
                notification.setSent(true);
                notification.setSentAt(LocalDateTime.now());
            } else {
                notification.setStatus("FAILED");
                notification.setErrorMessage("Notifications are disabled in system settings");
            }
        } catch (Exception e) {
            notification.setStatus("FAILED");
            notification.setErrorMessage(e.getMessage());
        }
        
        return notificationRepository.save(notification);
    }
    
    // Send email
    private void sendEmail(Notification notification, SystemSettings settings) throws Exception {
        if (notification.getMemberEmail() == null || notification.getMemberEmail().isEmpty()) {
            throw new Exception("Member email is not available");
        }
        
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", settings.getEmailHost() != null ? settings.getEmailHost() : "smtp.gmail.com");
        props.put("mail.smtp.port", settings.getEmailPort() != null ? settings.getEmailPort() : 587);
        
        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(
                    settings.getEmailUsername() != null ? settings.getEmailUsername() : "",
                    settings.getEmailPassword() != null ? settings.getEmailPassword() : ""
                );
            }
        });
        
        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress(settings.getEmailUsername()));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(notification.getMemberEmail()));
        message.setSubject(notification.getSubject());
        message.setText(notification.getMessage());
        
        Transport.send(message);
    }
    
    // Send SMS (placeholder - integrate with actual SMS provider)
    private void sendSMS(Notification notification, SystemSettings settings) throws Exception {
        if (notification.getMemberContact() == null || notification.getMemberContact().isEmpty()) {
            throw new Exception("Member contact is not available");
        }
        
        // This is a placeholder. In production, integrate with actual SMS providers like:
        // - Twilio
        // - AWS SNS
        // - Nexmo/Vonage
        // - etc.
        
        System.out.println("SMS would be sent to: " + notification.getMemberContact());
        System.out.println("Message: " + notification.getMessage());
        System.out.println("Provider: " + settings.getSmsProvider());
        
        // Simulate successful SMS sending
        // In production, replace with actual API calls
    }
    
    // Send bulk notifications
    public Map<String, Object> sendBulkNotifications(List<String> notificationIds) {
        int sent = 0;
        int failed = 0;
        
        for (String id : notificationIds) {
            try {
                Notification notification = sendNotification(id);
                if ("SENT".equals(notification.getStatus())) {
                    sent++;
                } else {
                    failed++;
                }
            } catch (Exception e) {
                failed++;
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("sent", sent);
        result.put("failed", failed);
        result.put("total", notificationIds.size());
        return result;
    }
    
    // Create due date reminder notification
    public Notification createDueDateReminder(BorrowRecord borrow, Member member) {
        Notification notification = new Notification();
        notification.setMemberId(member.getId());
        notification.setMemberName(member.getName());
        notification.setMemberEmail(member.getEmail());
        notification.setMemberContact(member.getContact());
        notification.setCategory("DUE_DATE_REMINDER");
        notification.setRelatedEntityId(borrow.getId());
        
        SystemSettings settings = getSystemSettings();
        if (settings.getEmailNotificationsEnabled() && settings.getSmsNotificationsEnabled()) {
            notification.setType("BOTH");
        } else if (settings.getEmailNotificationsEnabled()) {
            notification.setType("EMAIL");
        } else if (settings.getSmsNotificationsEnabled()) {
            notification.setType("SMS");
        } else {
            notification.setType("EMAIL");
        }
        
        notification.setSubject("Book Due Date Reminder");
        notification.setMessage(String.format(
            "Dear %s,\n\nThis is a reminder that your borrowed book '%s' is due on %s.\n\nPlease return it on time to avoid fines.\n\nThank you,\n%s",
            member.getName(),
            borrow.getBookTitle(),
            borrow.getDueDate(),
            settings.getLibraryName()
        ));
        
        return notificationRepository.save(notification);
    }
    
    // Create overdue reminder notification
    public Notification createOverdueReminder(BorrowRecord borrow, Member member) {
        Notification notification = new Notification();
        notification.setMemberId(member.getId());
        notification.setMemberName(member.getName());
        notification.setMemberEmail(member.getEmail());
        notification.setMemberContact(member.getContact());
        notification.setCategory("OVERDUE_REMINDER");
        notification.setRelatedEntityId(borrow.getId());
        
        SystemSettings settings = getSystemSettings();
        if (settings.getEmailNotificationsEnabled() && settings.getSmsNotificationsEnabled()) {
            notification.setType("BOTH");
        } else if (settings.getEmailNotificationsEnabled()) {
            notification.setType("EMAIL");
        } else if (settings.getSmsNotificationsEnabled()) {
            notification.setType("SMS");
        } else {
            notification.setType("EMAIL");
        }
        
        notification.setSubject("Overdue Book Notice");
        notification.setMessage(String.format(
            "Dear %s,\n\nYour borrowed book '%s' is now overdue. It was due on %s.\n\nPlease return it immediately. Late fees may apply.\n\nThank you,\n%s",
            member.getName(),
            borrow.getBookTitle(),
            borrow.getDueDate(),
            settings.getLibraryName()
        ));
        
        return notificationRepository.save(notification);
    }
    
    // Create reservation ready notification
    public Notification createReservationReadyNotification(Reservation reservation, Member member) {
        Notification notification = new Notification();
        notification.setMemberId(member.getId());
        notification.setMemberName(member.getName());
        notification.setMemberEmail(member.getEmail());
        notification.setMemberContact(member.getContact());
        notification.setCategory("RESERVATION_READY");
        notification.setRelatedEntityId(reservation.getId());
        
        SystemSettings settings = getSystemSettings();
        if (settings.getEmailNotificationsEnabled() && settings.getSmsNotificationsEnabled()) {
            notification.setType("BOTH");
        } else if (settings.getEmailNotificationsEnabled()) {
            notification.setType("EMAIL");
        } else if (settings.getSmsNotificationsEnabled()) {
            notification.setType("SMS");
        } else {
            notification.setType("EMAIL");
        }
        
        notification.setSubject("Reserved Book Available");
        notification.setMessage(String.format(
            "Dear %s,\n\nYour reserved book '%s' is now available for pickup.\n\nPlease collect it within %d days.\n\nThank you,\n%s",
            member.getName(),
            reservation.getBookTitle(),
            settings.getReservationExpiryDays(),
            settings.getLibraryName()
        ));
        
        return notificationRepository.save(notification);
    }
    
    // Create fine notice notification
    public Notification createFineNotification(Fine fine, Member member) {
        Notification notification = new Notification();
        notification.setMemberId(member.getId());
        notification.setMemberName(member.getName());
        notification.setMemberEmail(member.getEmail());
        notification.setMemberContact(member.getContact());
        notification.setCategory("FINE_NOTICE");
        notification.setRelatedEntityId(fine.getId());
        
        SystemSettings settings = getSystemSettings();
        if (settings.getEmailNotificationsEnabled() && settings.getSmsNotificationsEnabled()) {
            notification.setType("BOTH");
        } else if (settings.getEmailNotificationsEnabled()) {
            notification.setType("EMAIL");
        } else if (settings.getSmsNotificationsEnabled()) {
            notification.setType("SMS");
        } else {
            notification.setType("EMAIL");
        }
        
        notification.setSubject("Fine Notice");
        notification.setMessage(String.format(
            "Dear %s,\n\nYou have an outstanding fine of $%.2f for the book '%s'.\n\nPlease pay at your earliest convenience.\n\nThank you,\n%s",
            member.getName(),
            fine.getAmount(),
            fine.getBookTitle(),
            settings.getLibraryName()
        ));
        
        return notificationRepository.save(notification);
    }
    
    // Create custom notification
    public Notification createCustomNotification(String memberId, String subject, String message, String category) {
        Optional<Member> optMember = memberRepository.findById(memberId);
        if (!optMember.isPresent()) {
            throw new RuntimeException("Member not found");
        }
        
        Member member = optMember.get();
        Notification notification = new Notification();
        notification.setMemberId(member.getId());
        notification.setMemberName(member.getName());
        notification.setMemberEmail(member.getEmail());
        notification.setMemberContact(member.getContact());
        notification.setCategory(category != null ? category : "GENERAL");
        
        SystemSettings settings = getSystemSettings();
        if (settings.getEmailNotificationsEnabled() && settings.getSmsNotificationsEnabled()) {
            notification.setType("BOTH");
        } else if (settings.getEmailNotificationsEnabled()) {
            notification.setType("EMAIL");
        } else if (settings.getSmsNotificationsEnabled()) {
            notification.setType("SMS");
        } else {
            notification.setType("EMAIL");
        }
        
        notification.setSubject(subject);
        notification.setMessage(message);
        
        return notificationRepository.save(notification);
    }
    
    // Scheduled task to send automatic notifications (runs daily at 9 AM)
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendAutomaticNotifications() {
        SystemSettings settings = getSystemSettings();
        
        if (!settings.getEmailNotificationsEnabled() && !settings.getSmsNotificationsEnabled()) {
            return; // Skip if notifications are disabled
        }
        
        // Send due date reminders
        sendDueDateReminders(settings);
        
        // Send overdue reminders
        sendOverdueReminders(settings);
    }
    
    // Send due date reminders
    private void sendDueDateReminders(SystemSettings settings) {
        LocalDate reminderDate = LocalDate.now().plusDays(settings.getDueDateReminderDays());
        
        List<BorrowRecord> upcomingDueBorrows = borrowRecordRepository.findAll().stream()
            .filter(b -> "BORROWED".equals(b.getStatus()))
            .filter(b -> {
                LocalDate dueDate = b.getDueDate().toInstant()
                    .atZone(ZoneId.systemDefault()).toLocalDate();
                return dueDate.equals(reminderDate);
            })
            .collect(Collectors.toList());
        
        for (BorrowRecord borrow : upcomingDueBorrows) {
            Optional<Member> optMember = memberRepository.findById(borrow.getMemberId());
            if (optMember.isPresent()) {
                Notification notification = createDueDateReminder(borrow, optMember.get());
                try {
                    sendNotification(notification.getId());
                } catch (Exception e) {
                    System.err.println("Failed to send due date reminder: " + e.getMessage());
                }
            }
        }
    }
    
    // Send overdue reminders
    private void sendOverdueReminders(SystemSettings settings) {
        LocalDate overdueDate = LocalDate.now().minusDays(settings.getOverdueReminderDays());
        
        List<BorrowRecord> overdueBorrows = borrowRecordRepository.findAll().stream()
            .filter(b -> "BORROWED".equals(b.getStatus()))
            .filter(b -> {
                LocalDate dueDate = b.getDueDate().toInstant()
                    .atZone(ZoneId.systemDefault()).toLocalDate();
                return dueDate.isBefore(LocalDate.now());
            })
            .collect(Collectors.toList());
        
        for (BorrowRecord borrow : overdueBorrows) {
            Optional<Member> optMember = memberRepository.findById(borrow.getMemberId());
            if (optMember.isPresent()) {
                Notification notification = createOverdueReminder(borrow, optMember.get());
                try {
                    sendNotification(notification.getId());
                } catch (Exception e) {
                    System.err.println("Failed to send overdue reminder: " + e.getMessage());
                }
            }
        }
    }
    
    // Get notification statistics
    public Map<String, Object> getNotificationStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalNotifications = notificationRepository.count();
        long sentNotifications = notificationRepository.countByStatus("SENT");
        long pendingNotifications = notificationRepository.countByStatus("PENDING");
        long failedNotifications = notificationRepository.countByStatus("FAILED");
        
        long dueDateReminders = notificationRepository.countByCategory("DUE_DATE_REMINDER");
        long overdueReminders = notificationRepository.countByCategory("OVERDUE_REMINDER");
        long reservationNotifications = notificationRepository.countByCategory("RESERVATION_READY");
        long fineNotifications = notificationRepository.countByCategory("FINE_NOTICE");
        long generalNotifications = notificationRepository.countByCategory("GENERAL");
        
        stats.put("total", totalNotifications);
        stats.put("sent", sentNotifications);
        stats.put("pending", pendingNotifications);
        stats.put("failed", failedNotifications);
        stats.put("dueDateReminders", dueDateReminders);
        stats.put("overdueReminders", overdueReminders);
        stats.put("reservationNotifications", reservationNotifications);
        stats.put("fineNotifications", fineNotifications);
        stats.put("generalNotifications", generalNotifications);
        
        return stats;
    }
    
    // Delete notification
    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }
    
    // Delete old notifications (older than 90 days)
    public int deleteOldNotifications() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(90);
        List<Notification> oldNotifications = notificationRepository
            .findByStatusAndCreatedAtBefore("SENT", cutoffDate);
        
        int count = oldNotifications.size();
        notificationRepository.deleteAll(oldNotifications);
        return count;
    }
    
    // Test notification configuration
    public Map<String, Object> testNotificationConfiguration(String testEmail, String testPhone) {
        Map<String, Object> result = new HashMap<>();
        SystemSettings settings = getSystemSettings();
        
        // Test email
        if (settings.getEmailNotificationsEnabled()) {
            try {
                Notification testNotification = new Notification();
                testNotification.setMemberEmail(testEmail);
                testNotification.setSubject("Test Email from Library System");
                testNotification.setMessage("This is a test email to verify your email configuration.");
                testNotification.setType("EMAIL");
                
                sendEmail(testNotification, settings);
                result.put("emailStatus", "SUCCESS");
                result.put("emailMessage", "Test email sent successfully");
            } catch (Exception e) {
                result.put("emailStatus", "FAILED");
                result.put("emailMessage", e.getMessage());
            }
        } else {
            result.put("emailStatus", "DISABLED");
            result.put("emailMessage", "Email notifications are disabled");
        }
        
        // Test SMS
        if (settings.getSmsNotificationsEnabled()) {
            try {
                Notification testNotification = new Notification();
                testNotification.setMemberContact(testPhone);
                testNotification.setMessage("This is a test SMS from Library System");
                testNotification.setType("SMS");
                
                sendSMS(testNotification, settings);
                result.put("smsStatus", "SUCCESS");
                result.put("smsMessage", "Test SMS sent successfully");
            } catch (Exception e) {
                result.put("smsStatus", "FAILED");
                result.put("smsMessage", e.getMessage());
            }
        } else {
            result.put("smsStatus", "DISABLED");
            result.put("smsMessage", "SMS notifications are disabled");
        }
        
        return result;
    }
    
    private SystemSettings getSystemSettings() {
        List<SystemSettings> settings = settingsRepository.findAll();
        if (settings.isEmpty()) {
            SystemSettings defaultSettings = new SystemSettings();
            defaultSettings.setLibraryName("Library Management System");
            return settingsRepository.save(defaultSettings);
        }
        return settings.get(0);
    }
}
