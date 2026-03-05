package com.example.lms.service;

import com.example.lms.model.*;
import com.example.lms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import jakarta.mail.*;
import jakarta.mail.internet.*;
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
    private BookRepository bookRepository;
    
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
                if (!settings.getEmailNotificationsEnabled()) {
                    errorMsg = "Email notifications are disabled";
                } else if (notification.getMemberEmail() == null || notification.getMemberEmail().isEmpty()) {
                    errorMsg = "Member doesn't have an email address";
                } else if (!isValidEmail(notification.getMemberEmail())) {
                    errorMsg = "Email address is invalid";
                } else if (settings.getEmailUsername() == null || settings.getEmailUsername().isEmpty()) {
                    errorMsg = "Email configuration is incomplete - missing username";
                } else if (settings.getEmailPassword() == null || settings.getEmailPassword().isEmpty()) {
                    errorMsg = "Email configuration is incomplete - missing password";
                } else {
                    sendEmail(notification, settings);
                    success = true;
                }
            }
            
            if ("SMS".equals(notification.getType()) || "BOTH".equals(notification.getType())) {
                // SMS temporarily disabled - skip SMS sending for now
                System.out.println("=== SMS SKIPPED (Not Configured) ===");
                System.out.println("To: " + (notification.getMemberContact() != null ? notification.getMemberContact() : "No phone"));
                System.out.println("Message: " + notification.getMessage());
                System.out.println("===================================");
                
                // Don't fail the notification if it's BOTH type and email succeeded
                if ("BOTH".equals(notification.getType()) && success) {
                    // Email already succeeded, so overall notification is successful
                } else if ("SMS".equals(notification.getType())) {
                    // Pure SMS notification - mark as failed but with informative message
                    if (errorMsg == null) errorMsg = "SMS provider not configured";
                }
            }
            
            if (success) {
                notification.setStatus("SENT");
                notification.setSent(true);
                notification.setSentAt(LocalDateTime.now());
                notification.setErrorMessage(null);
            } else {
                notification.setStatus("FAILED");
                notification.setErrorMessage(errorMsg != null ? errorMsg : "Unknown error occurred");
            }
        } catch (Exception e) {
            notification.setStatus("FAILED");
            notification.setErrorMessage(e.getMessage());
        }
        
        return notificationRepository.save(notification);
    }

    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        // Robust email regex pattern that accepts Gmail and other common formats
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email.matches(emailRegex);
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
    
    // Send SMS (integrate with actual SMS provider)
    private void sendSMS(Notification notification, SystemSettings settings) throws Exception {
        if (notification.getMemberContact() == null || notification.getMemberContact().isEmpty()) {
            throw new Exception("Member contact is not available");
        }
        
        String smsProvider = settings.getSmsProvider();
        String smsApiKey = settings.getSmsApiKey();
        
        if (smsProvider == null || smsApiKey == null) {
            throw new Exception("SMS provider not configured");
        }
        
        // Implement different SMS providers
       // switch (smsProvider.toUpperCase()) {
            case "TWILIO":
                sendTwilioSMS(notification, settings);
                break;
           // case "AWS_SNS":
                sendAWSSMS(notification, settings);
                break;
            case "NEXMO":
                sendNexmoSMS(notification, settings);
                break;
            default:
                // For demo purposes, log the SMS
                System.out.println("=== SMS NOTIFICATION ===");
                System.out.println("To: " + notification.getMemberContact());
                System.out.println("Message: " + notification.getMessage());
                System.out.println("Provider: " + smsProvider);
                System.out.println("========================");
                break;
        }
    }
    
    //private void sendTwilioSMS(Notification notification, SystemSettings settings) throws Exception {
        // Twilio SMS implementation
        // Note: This requires Twilio Java SDK dependency
        // Add to pom.xml: <dependency><groupId>com.twilio.sdk</groupId><artifactId>twilio</artifactId><version>9.14.1</version></dependency>
        
        try {
            // Initialize Twilio client
            String accountSid = settings.getSmsUsername(); // Twilio Account SID
            String authToken = settings.getSmsApiKey();    // Twilio Auth Token
            String fromNumber = settings.getSmsFromNumber(); // Twilio phone number
            
            if (accountSid == null || authToken == null || fromNumber == null) {
                throw new Exception("Twilio configuration incomplete");
            }
            
            // For now, simulate Twilio API call
            System.out.println("=== TWILIO SMS ===");
            System.out.println("Account SID: " + accountSid);
            System.out.println("From: " + fromNumber);
            System.out.println("To: " + notification.getMemberContact());
            System.out.println("Message: " + notification.getMessage());
            System.out.println("==================");
            
            // Actual Twilio implementation would be:
            // Twilio.init(accountSid, authToken);
            // Message message = Message.creator(
            //     new PhoneNumber(notification.getMemberContact()),
            //     new PhoneNumber(fromNumber),
            //     notification.getMessage()
            // ).create();
            
        } catch (Exception e) {
            throw new Exception("Twilio SMS failed: " + e.getMessage());
        }
    }
    
    private void sendAWSSMS(Notification notification, SystemSettings settings) throws Exception {
        // AWS SNS SMS implementation
        System.out.println("=== AWS SNS SMS ===");
        System.out.println("To: " + notification.getMemberContact());
        System.out.println("Message: " + notification.getMessage());
        System.out.println("===================");
        
        // Actual AWS SNS implementation would require AWS SDK
        throw new Exception("AWS SNS SMS not implemented yet");
    }
    
    private void sendNexmoSMS(Notification notification, SystemSettings settings) throws Exception {
        // Nexmo/Vonage SMS implementation
        System.out.println("=== NEXMO SMS ===");
        System.out.println("To: " + notification.getMemberContact());
        System.out.println("Message: " + notification.getMessage());
        System.out.println("=================");
        
        // Actual Nexmo implementation would require Nexmo SDK
        throw new Exception("Nexmo SMS not implemented yet");
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
        
        // Get book title from book repository
        String bookTitle = "Unknown Book";
        try {
            Optional<Book> optBook = bookRepository.findById(borrow.getBookID());
            if (optBook.isPresent()) {
                bookTitle = optBook.get().getTitle();
            }
        } catch (Exception e) {
            System.err.println("Error fetching book title: " + e.getMessage());
        }
        
        notification.setSubject("Book Due Date Reminder");
        notification.setMessage(String.format(
            "Dear %s,\n\nThis is a reminder that your borrowed book '%s' is due on %s.\n\nPlease return it on time to avoid fines.\n\nThank you,\n%s",
            member.getName(),
            bookTitle,
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
        
        // Get book title from book repository
        String bookTitle = "Unknown Book";
        try {
            Optional<Book> optBook = bookRepository.findById(borrow.getBookID());
            if (optBook.isPresent()) {
                bookTitle = optBook.get().getTitle();
            }
        } catch (Exception e) {
            System.err.println("Error fetching book title: " + e.getMessage());
        }
        
        notification.setSubject("Overdue Book Notice");
        notification.setMessage(String.format(
            "Dear %s,\n\nYour borrowed book '%s' is now overdue. It was due on %s.\n\nPlease return it immediately. Late fees may apply.\n\nThank you,\n%s",
            member.getName(),
            bookTitle,
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
        
        // Get book title from book repository
        String bookTitle = "Unknown Book";
        try {
            Optional<Book> optBook = bookRepository.findById(reservation.getBookID());
            if (optBook.isPresent()) {
                bookTitle = optBook.get().getTitle();
            }
        } catch (Exception e) {
            System.err.println("Error fetching book title: " + e.getMessage());
        }
        
        notification.setSubject("Reserved Book Available");
        notification.setMessage(String.format(
            "Dear %s,\n\nYour reserved book '%s' is now available for pickup.\n\nPlease collect it within %d days.\n\nThank you,\n%s",
            member.getName(),
            bookTitle,
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
        
        // Get book title from the borrow record associated with the fine
        String bookTitle = "Unknown Book";
        try {
            if (fine.getBorrowRecordID() != null) {
                Optional<BorrowRecord> optBorrowRecord = borrowRecordRepository.findById(fine.getBorrowRecordID());
                if (optBorrowRecord.isPresent()) {
                    BorrowRecord borrowRecord = optBorrowRecord.get();
                    Optional<Book> optBook = bookRepository.findById(borrowRecord.getBookID());
                    if (optBook.isPresent()) {
                        bookTitle = optBook.get().getTitle();
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching book title for fine: " + e.getMessage());
        }
        
        notification.setSubject("Fine Notice");
        notification.setMessage(String.format(
            "Dear %s,\n\nYou have an outstanding fine of $%.2f for %s.\n\nReason: %s\n\nPlease pay at your earliest convenience.\n\nThank you,\n%s",
            member.getName(),
            fine.getAmount(),
            bookTitle,
            fine.getReason(),
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
            .filter(b -> "APPROVED".equals(b.getStatus()) && b.getReturnDate() == null)
            .filter(b -> {
                LocalDate dueDate = b.getDueDate();
                return dueDate != null && dueDate.equals(reminderDate);
            })
            .collect(Collectors.toList());
        
        for (BorrowRecord borrow : upcomingDueBorrows) {
            Optional<Member> optMember = memberRepository.findById(borrow.getMemberID());
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
        List<BorrowRecord> overdueBorrows = borrowRecordRepository.findAll().stream()
            .filter(b -> "APPROVED".equals(b.getStatus()) && b.getReturnDate() == null)
            .filter(b -> {
                LocalDate dueDate = b.getDueDate();
                return dueDate != null && dueDate.isBefore(LocalDate.now());
            })
            .collect(Collectors.toList());
        
        for (BorrowRecord borrow : overdueBorrows) {
            Optional<Member> optMember = memberRepository.findById(borrow.getMemberID());
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
        
        // Test SMS - temporarily disabled
        result.put("smsStatus", "SKIPPED");
        result.put("smsMessage", "SMS provider not configured - feature temporarily disabled");
        
        return result;
    }
    
    // Create borrow approval notification
    public Notification createBorrowApprovalNotification(BorrowRecord borrow, Member member, Book book) {
        Notification notification = new Notification();
        notification.setMemberId(member.getId());
        notification.setMemberName(member.getName());
        notification.setMemberEmail(member.getEmail());
        notification.setMemberContact(member.getContact());
        notification.setCategory("BORROW_APPROVAL");
        notification.setRelatedEntityId(borrow.getId());
        
        SystemSettings settings = getSystemSettings();
        
        // Determine notification type based on what's available for this member
        boolean hasEmail = member.getEmail() != null && !member.getEmail().isEmpty();
        boolean hasContact = member.getContact() != null && !member.getContact().isEmpty();
        boolean emailEnabled = settings.getEmailNotificationsEnabled();
        boolean smsEnabled = settings.getSmsNotificationsEnabled();
        
        if (hasEmail && hasContact && emailEnabled && smsEnabled) {
            notification.setType("BOTH");
        } else if (hasEmail && emailEnabled) {
            notification.setType("EMAIL");
        } else if (hasContact && smsEnabled) {
            notification.setType("SMS");
        } else {
            notification.setType("EMAIL");
            notification.setStatus("FAILED");
            notification.setErrorMessage("Member has no email or phone number");
        }
        
        notification.setSubject("Book Borrow Request Approved");
        notification.setMessage(String.format(
            "Dear %s,\n\nGreat news! Your request to borrow '%s' has been approved.\n\nBorrow Details:\n- Book: %s\n- Issue Date: %s\n- Due Date: %s\n\nPlease collect the book from the library.\n\nThank you,\n%s",
            member.getName(),
            book.getTitle(),
            book.getTitle(),
            borrow.getIssueDate(),
            borrow.getDueDate(),
            settings.getLibraryName()
        ));
        
        return notificationRepository.save(notification);
    }
    
    // Create borrow rejection notification
    public Notification createBorrowRejectionNotification(BorrowRecord borrow, Member member, Book book) {
        Notification notification = new Notification();
        notification.setMemberId(member.getId());
        notification.setMemberName(member.getName());
        notification.setMemberEmail(member.getEmail());
        notification.setMemberContact(member.getContact());
        notification.setCategory("BORROW_REJECTION");
        notification.setRelatedEntityId(borrow.getId());
        
        SystemSettings settings = getSystemSettings();
        
        // Determine notification type based on what's available for this member
        boolean hasEmail = member.getEmail() != null && !member.getEmail().isEmpty();
        boolean hasContact = member.getContact() != null && !member.getContact().isEmpty();
        boolean emailEnabled = settings.getEmailNotificationsEnabled();
        boolean smsEnabled = settings.getSmsNotificationsEnabled();
        
        if (hasEmail && hasContact && emailEnabled && smsEnabled) {
            notification.setType("BOTH");
        } else if (hasEmail && emailEnabled) {
            notification.setType("EMAIL");
        } else if (hasContact && smsEnabled) {
            notification.setType("SMS");
        } else {
            notification.setType("EMAIL");
            notification.setStatus("FAILED");
            notification.setErrorMessage("Member has no email or phone number");
        }
        
        notification.setSubject("Book Borrow Request Rejected");
        notification.setMessage(String.format(
            "Dear %s,\n\nWe regret to inform you that your request to borrow '%s' has been rejected.\n\nThis could be due to:\n- Book is currently unavailable\n- Outstanding fines on your account\n- Maximum borrow limit reached\n\nPlease contact the library for more information.\n\nThank you,\n%s",
            member.getName(),
            book.getTitle(),
            settings.getLibraryName()
        ));
        
        return notificationRepository.save(notification);
    }
    
    // Create book return confirmation notification
    public Notification createBookReturnConfirmationNotification(BorrowRecord borrow, Member member, Book book) {
        Notification notification = new Notification();
        notification.setMemberId(member.getId());
        notification.setMemberName(member.getName());
        notification.setMemberEmail(member.getEmail());
        notification.setMemberContact(member.getContact());
        notification.setCategory("BOOK_RETURN");
        notification.setRelatedEntityId(borrow.getId());
        
        SystemSettings settings = getSystemSettings();
        
        // Determine notification type based on what's available for this member
        boolean hasEmail = member.getEmail() != null && !member.getEmail().isEmpty();
        boolean hasContact = member.getContact() != null && !member.getContact().isEmpty();
        boolean emailEnabled = settings.getEmailNotificationsEnabled();
        boolean smsEnabled = settings.getSmsNotificationsEnabled();
        
        if (hasEmail && hasContact && emailEnabled && smsEnabled) {
            notification.setType("BOTH");
        } else if (hasEmail && emailEnabled) {
            notification.setType("EMAIL");
        } else if (hasContact && smsEnabled) {
            notification.setType("SMS");
        } else {
            notification.setType("EMAIL");
            notification.setStatus("FAILED");
            notification.setErrorMessage("Member has no email or phone number");
        }
        
        notification.setSubject("Book Return Confirmed");
        notification.setMessage(String.format(
            "Dear %s,\n\nThank you for returning '%s' on time!\n\nReturn Details:\n- Book: %s\n- Return Date: %s\n- Status: Returned Successfully\n\nWe appreciate your responsible use of library resources.\n\nThank you,\n%s",
            member.getName(),
            book.getTitle(),
            book.getTitle(),
            borrow.getReturnDate(),
            settings.getLibraryName()
        ));
        
        return notificationRepository.save(notification);
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
    
    // Create payment confirmation notification
    public Notification createPaymentConfirmationNotification(Fine fine, Member member, Payment payment) {
        Notification notification = new Notification();
        notification.setMemberId(member.getId());
        notification.setMemberName(member.getName());
        notification.setMemberEmail(member.getEmail());
        notification.setMemberContact(member.getContact());
        notification.setCategory("PAYMENT_CONFIRMATION");
        notification.setRelatedEntityId(fine.getId());
        
        SystemSettings settings = getSystemSettings();
        
        // Determine notification type based on what's available for this member
        boolean hasEmail = member.getEmail() != null && !member.getEmail().isEmpty();
        boolean hasContact = member.getContact() != null && !member.getContact().isEmpty();
        boolean emailEnabled = settings.getEmailNotificationsEnabled();
        boolean smsEnabled = settings.getSmsNotificationsEnabled();
        
        if (hasEmail && hasContact && emailEnabled && smsEnabled) {
            notification.setType("BOTH");
        } else if (hasEmail && emailEnabled) {
            notification.setType("EMAIL");
        } else if (hasContact && smsEnabled) {
            notification.setType("SMS");
        } else {
            notification.setType("EMAIL");
            notification.setStatus("FAILED");
            notification.setErrorMessage("Member has no email or phone number");
        }
        
        notification.setSubject("Payment Received - Receipt");
        notification.setMessage(String.format(
            "Dear %s,\n\nThank you for your payment!\n\nPayment Details:\n- Amount Paid: $%.2f\n- Payment Date: %s\n- Payment Method: %s\n- Fine Status: %s\n\nYour payment has been successfully processed.\n\nThank you,\n%s",
            member.getName(),
            payment.getAmount(),
            payment.getPaymentDate(),
            payment.getPaymentMethod(),
            fine.getStatus(),
            settings.getLibraryName()
        ));
        
        return notificationRepository.save(notification);
    }
    
    // Create fine waiver notification
    public Notification createFineWaiverNotification(Fine fine, Member member, String reason) {
        Notification notification = new Notification();
        notification.setMemberId(member.getId());
        notification.setMemberName(member.getName());
        notification.setMemberEmail(member.getEmail());
        notification.setMemberContact(member.getContact());
        notification.setCategory("FINE_WAIVER");
        notification.setRelatedEntityId(fine.getId());
        
        SystemSettings settings = getSystemSettings();
        
        // Determine notification type based on what's available for this member
        boolean hasEmail = member.getEmail() != null && !member.getEmail().isEmpty();
        boolean hasContact = member.getContact() != null && !member.getContact().isEmpty();
        boolean emailEnabled = settings.getEmailNotificationsEnabled();
        boolean smsEnabled = settings.getSmsNotificationsEnabled();
        
        if (hasEmail && hasContact && emailEnabled && smsEnabled) {
            notification.setType("BOTH");
        } else if (hasEmail && emailEnabled) {
            notification.setType("EMAIL");
        } else if (hasContact && smsEnabled) {
            notification.setType("SMS");
        } else {
            notification.setType("EMAIL");
            notification.setStatus("FAILED");
            notification.setErrorMessage("Member has no email or phone number");
        }
        
        notification.setSubject("Fine Waived - Good News!");
        notification.setMessage(String.format(
            "Dear %s,\n\nGreat news! Your fine has been waived.\n\nFine Details:\n- Original Amount: $%.2f\n- Reason for Waiver: %s\n- Waived Date: %s\n\nNo payment is required for this fine.\n\nThank you,\n%s",
            member.getName(),
            fine.getAmount(),
            reason,
            fine.getPaidDate(),
            settings.getLibraryName()
        ));

        return notificationRepository.save(notification);
    }
    
    // Create reservation approval notification
    public Notification createReservationApprovalNotification(Reservation reservation, Member member, Book book) {
        Notification notification = new Notification();
        notification.setMemberId(member.getId());
        notification.setMemberName(member.getName());
        notification.setMemberEmail(member.getEmail());
        notification.setMemberContact(member.getContact());
        notification.setCategory("RESERVATION_APPROVAL");
        notification.setRelatedEntityId(reservation.getId());
        
        SystemSettings settings = getSystemSettings();
        
        // Determine notification type based on what's available for this member
        boolean hasEmail = member.getEmail() != null && !member.getEmail().isEmpty();
        boolean hasContact = member.getContact() != null && !member.getContact().isEmpty();
        boolean emailEnabled = settings.getEmailNotificationsEnabled();
        boolean smsEnabled = settings.getSmsNotificationsEnabled();
        
        if (hasEmail && hasContact && emailEnabled && smsEnabled) {
            notification.setType("BOTH");
        } else if (hasEmail && emailEnabled) {
            notification.setType("EMAIL");
        } else if (hasContact && smsEnabled) {
            notification.setType("SMS");
        } else {
            notification.setType("EMAIL");
            notification.setStatus("FAILED");
            notification.setErrorMessage("Member has no email or phone number");
        }
        
        notification.setSubject("Book Reservation Approved");
        notification.setMessage(String.format(
            "Dear %s,\n\nGreat news! Your reservation for '%s' has been approved.\n\nReservation Details:\n- Book: %s\n- Reservation Date: %s\n- Status: Approved\n\nWe will notify you when the book becomes available for pickup.\n\nThank you,\n%s",
            member.getName(),
            book.getTitle(),
            book.getTitle(),
            reservation.getReservationDate(),
            settings.getLibraryName()
        ));
        
        return notificationRepository.save(notification);
    }
    
    // Create reservation cancellation notification
    public Notification createReservationCancellationNotification(Reservation reservation, Member member, Book book) {
        Notification notification = new Notification();
        notification.setMemberId(member.getId());
        notification.setMemberName(member.getName());
        notification.setMemberEmail(member.getEmail());
        notification.setMemberContact(member.getContact());
        notification.setCategory("RESERVATION_CANCELLATION");
        notification.setRelatedEntityId(reservation.getId());
        
        SystemSettings settings = getSystemSettings();
        
        // Determine notification type based on what's available for this member
        boolean hasEmail = member.getEmail() != null && !member.getEmail().isEmpty();
        boolean hasContact = member.getContact() != null && !member.getContact().isEmpty();
        boolean emailEnabled = settings.getEmailNotificationsEnabled();
        boolean smsEnabled = settings.getSmsNotificationsEnabled();
        
        if (hasEmail && hasContact && emailEnabled && smsEnabled) {
            notification.setType("BOTH");
        } else if (hasEmail && emailEnabled) {
            notification.setType("EMAIL");
        } else if (hasContact && smsEnabled) {
            notification.setType("SMS");
        } else {
            notification.setType("EMAIL");
            notification.setStatus("FAILED");
            notification.setErrorMessage("Member has no email or phone number");
        }
        
        notification.setSubject("Reservation Cancelled");
        notification.setMessage(String.format(
            "Dear %s,\n\nWe regret to inform you that your reservation for '%s' has been cancelled.\n\nReservation Details:\n- Book: %s\n- Original Reservation Date: %s\n- Cancellation Date: %s\n\nThis could be due to:\n- Book no longer available\n- System maintenance\n- Administrative decision\n\nPlease contact the library for more information or to make a new reservation.\n\nThank you,\n%s",
            member.getName(),
            book.getTitle(),
            book.getTitle(),
            reservation.getReservationDate(),
            LocalDate.now(),
            settings.getLibraryName()
        ));
        
        return notificationRepository.save(notification);
    }
    
    // Create damaged book notification
    public Notification createDamagedBookNotification(Fine fine, Member member, String damageDescription) {
        Notification notification = new Notification();
        notification.setMemberId(member.getId());
        notification.setMemberName(member.getName());
        notification.setMemberEmail(member.getEmail());
        notification.setMemberContact(member.getContact());
        notification.setCategory("DAMAGED_BOOK_FINE");
        notification.setRelatedEntityId(fine.getId());
        
        SystemSettings settings = getSystemSettings();
        
        // Determine notification type based on what's available for this member
        boolean hasEmail = member.getEmail() != null && !member.getEmail().isEmpty();
        boolean hasContact = member.getContact() != null && !member.getContact().isEmpty();
        boolean emailEnabled = settings.getEmailNotificationsEnabled();
        boolean smsEnabled = settings.getSmsNotificationsEnabled();
        
        if (hasEmail && hasContact && emailEnabled && smsEnabled) {
            notification.setType("BOTH");
        } else if (hasEmail && emailEnabled) {
            notification.setType("EMAIL");
        } else if (hasContact && smsEnabled) {
            notification.setType("SMS");
        } else {
            notification.setType("EMAIL");
            notification.setStatus("FAILED");
            notification.setErrorMessage("Member has no email or phone number");
        }
        
        // Get book title from the borrow record associated with the fine
        String bookTitle = "Unknown Book";
        try {
            if (fine.getBorrowRecordID() != null) {
                Optional<BorrowRecord> optBorrowRecord = borrowRecordRepository.findById(fine.getBorrowRecordID());
                if (optBorrowRecord.isPresent()) {
                    BorrowRecord borrowRecord = optBorrowRecord.get();
                    Optional<Book> optBook = bookRepository.findById(borrowRecord.getBookID());
                    if (optBook.isPresent()) {
                        bookTitle = optBook.get().getTitle();
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching book title for damaged book fine: " + e.getMessage());
        }
        
        notification.setSubject("Damaged Book Fine Notice");
        notification.setMessage(String.format(
            "Dear %s,\n\nA fine has been applied to your account for returning a damaged book.\n\nBook: %s\nFine Amount: $%.2f\nDamage Description: %s\n\nPlease pay this fine at your earliest convenience. If you have any questions about this charge, please contact the library.\n\nThank you,\n%s",
            member.getName(),
            bookTitle,
            fine.getAmount(),
            damageDescription != null ? damageDescription : "Book returned in damaged condition",
            settings.getLibraryName()
        ));
        
        return notificationRepository.save(notification);
    }
    
    // Create lost book notification
    public Notification createLostBookNotification(Fine fine, Member member, String lostBookNotes) {
        Notification notification = new Notification();
        notification.setMemberId(member.getId());
        notification.setMemberName(member.getName());
        notification.setMemberEmail(member.getEmail());
        notification.setMemberContact(member.getContact());
        notification.setCategory("LOST_BOOK_FINE");
        notification.setRelatedEntityId(fine.getId());
        
        SystemSettings settings = getSystemSettings();
        
        // Determine notification type based on what's available for this member
        boolean hasEmail = member.getEmail() != null && !member.getEmail().isEmpty();
        boolean hasContact = member.getContact() != null && !member.getContact().isEmpty();
        boolean emailEnabled = settings.getEmailNotificationsEnabled();
        boolean smsEnabled = settings.getSmsNotificationsEnabled();
        
        if (hasEmail && hasContact && emailEnabled && smsEnabled) {
            notification.setType("BOTH");
        } else if (hasEmail && emailEnabled) {
            notification.setType("EMAIL");
        } else if (hasContact && smsEnabled) {
            notification.setType("SMS");
        } else {
            notification.setType("EMAIL");
            notification.setStatus("FAILED");
            notification.setErrorMessage("Member has no email or phone number");
        }
        
        // Get book title from the borrow record associated with the fine
        String bookTitle = "Unknown Book";
        try {
            if (fine.getBorrowRecordID() != null) {
                Optional<BorrowRecord> optBorrowRecord = borrowRecordRepository.findById(fine.getBorrowRecordID());
                if (optBorrowRecord.isPresent()) {
                    BorrowRecord borrowRecord = optBorrowRecord.get();
                    Optional<Book> optBook = bookRepository.findById(borrowRecord.getBookID());
                    if (optBook.isPresent()) {
                        bookTitle = optBook.get().getTitle();
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching book title for lost book fine: " + e.getMessage());
        }
        
        notification.setSubject("Lost Book Fine Notice");
        notification.setMessage(String.format(
            "Dear %s,\n\nA replacement cost fine has been applied to your account for a lost book.\n\nBook: %s\nReplacement Cost: $%.2f\nNotes: %s\n\nThis fine covers the cost of replacing the lost book. Please pay this fine to maintain your library privileges.\n\nIf you find the book, please return it to the library and we may be able to adjust the fine.\n\nThank you,\n%s",
            member.getName(),
            bookTitle,
            fine.getAmount(),
            lostBookNotes != null ? lostBookNotes : "Book reported as lost",
            settings.getLibraryName()
        ));

        return notificationRepository.save(notification);
    }
}