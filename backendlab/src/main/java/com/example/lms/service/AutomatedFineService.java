package com.example.lms.service;

import com.example.lms.model.BorrowRecord;
import com.example.lms.model.Fine;
import com.example.lms.model.Member;
import com.example.lms.model.SystemSettings;
import com.example.lms.repository.BorrowRecordRepository;
import com.example.lms.repository.FineRepository;
import com.example.lms.repository.MemberRepository;
import com.example.lms.repository.SystemSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * AutomatedFineService - Handles automatic fine processing and overdue detection
 * 
 * This service runs scheduled tasks to:
 * 1. Detect overdue books and create fines automatically
 * 2. Update overdue status on borrow records
 * 3. Send notifications for new fines
 * 
 * Scheduled Tasks:
 * - Daily overdue check (runs at 2 AM every day)
 * - Weekly fine report generation (runs every Sunday at 6 AM)
 */
@Service
public class AutomatedFineService {
    
    @Autowired
    private BorrowRecordRepository borrowRecordRepository;
    
    @Autowired
    private FineRepository fineRepository;
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private SystemSettingsRepository systemSettingsRepository;
    
    @Autowired(required = false)
    private FineService fineService;
    
    @Autowired(required = false)
    private NotificationService notificationService;
    
    /**
     * Get system settings with defaults if none exist
     */
    private SystemSettings getSystemSettings() {
        List<SystemSettings> settings = systemSettingsRepository.findAll();
        if (settings.isEmpty()) {
            SystemSettings defaultSettings = new SystemSettings();
            return systemSettingsRepository.save(defaultSettings);
        }
        return settings.get(0);
    }
    
    /**
     * Scheduled task to process overdue books and create fines
     * Runs daily at 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void processOverdueBooks() {
        System.out.println("Starting automated overdue book processing...");
        
        try {
            LocalDate today = LocalDate.now();
            
            // Find all approved borrows that are overdue but not yet marked as such
            List<BorrowRecord> overdueBorrows = borrowRecordRepository.findAll().stream()
                .filter(record -> "APPROVED".equals(record.getStatus()))
                .filter(record -> record.getReturnDate() == null) // Not yet returned
                .filter(record -> record.getDueDate() != null && record.getDueDate().isBefore(today))
                .filter(record -> !Boolean.TRUE.equals(record.getOverdue())) // Not already marked overdue
                .collect(Collectors.toList());
            
            int processedCount = 0;
            int finesCreated = 0;
            
            for (BorrowRecord record : overdueBorrows) {
                try {
                    // Mark as overdue
                    record.setOverdue(true);
                    borrowRecordRepository.save(record);
                    processedCount++;
                    
                    // Check if fine already exists
                    List<Fine> existingFines = fineRepository.findByBorrowRecordID(record.getId());
                    if (existingFines.isEmpty() && fineService != null) {
                        // Create overdue fine
                        SystemSettings settings = getSystemSettings();
                        long daysOverdue = ChronoUnit.DAYS.between(record.getDueDate(), today);
                        
                        Fine fine = new Fine();
                        fine.setMemberID(record.getMemberID());
                        fine.setBorrowRecordID(record.getId());
                        fine.setAmount(daysOverdue * settings.getFinePerDay());
                        fine.setAmountPaid(0.0);
                        fine.setReason("Overdue return: " + daysOverdue + " days late (auto-generated)");
                        fine.setIssueDate(today);
                        fine.setStatus("UNPAID");
                        
                        Fine savedFine = fineRepository.save(fine);
                        finesCreated++;
                        
                        // Send notification
                        if (notificationService != null) {
                            try {
                                Optional<Member> optMember = memberRepository.findById(record.getMemberID());
                                if (optMember.isPresent()) {
                                    notificationService.createFineNotification(savedFine, optMember.get());
                                }
                            } catch (Exception e) {
                                System.err.println("Failed to send fine notification for record " + record.getId() + ": " + e.getMessage());
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Failed to process overdue record " + record.getId() + ": " + e.getMessage());
                }
            }
            
            System.out.println("Automated overdue processing completed:");
            System.out.println("- Records marked as overdue: " + processedCount);
            System.out.println("- New fines created: " + finesCreated);
            
        } catch (Exception e) {
            System.err.println("Error in automated overdue processing: " + e.getMessage());
        }
    }
    
    /**
     * Scheduled task to update existing overdue fines with additional charges
     * Runs daily at 3:00 AM (after overdue processing)
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void updateOverdueFines() {
        System.out.println("Starting automated overdue fine updates...");
        
        try {
            LocalDate today = LocalDate.now();
            SystemSettings settings = getSystemSettings();
            
            // Find all unpaid overdue fines
            List<Fine> overdueFines = fineRepository.findAll().stream()
                .filter(fine -> "UNPAID".equals(fine.getStatus()) || "PARTIALLY_PAID".equals(fine.getStatus()))
                .filter(fine -> fine.getReason() != null && fine.getReason().contains("Overdue return"))
                .filter(fine -> fine.getBorrowRecordID() != null)
                .collect(Collectors.toList());
            
            int updatedCount = 0;
            
            for (Fine fine : overdueFines) {
                try {
                    Optional<BorrowRecord> optRecord = borrowRecordRepository.findById(fine.getBorrowRecordID());
                    if (optRecord.isPresent()) {
                        BorrowRecord record = optRecord.get();
                        
                        // Only update if book is still not returned
                        if (record.getReturnDate() == null && record.getDueDate() != null) {
                            long totalDaysOverdue = ChronoUnit.DAYS.between(record.getDueDate(), today);
                            Double newAmount = totalDaysOverdue * settings.getFinePerDay();
                            
                            // Only update if the amount has increased
                            if (newAmount > fine.getAmount()) {
                                fine.setAmount(newAmount);
                                fine.setReason("Overdue return: " + totalDaysOverdue + " days late (auto-updated)");
                                fineRepository.save(fine);
                                updatedCount++;
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Failed to update fine " + fine.getId() + ": " + e.getMessage());
                }
            }
            
            System.out.println("Automated fine updates completed: " + updatedCount + " fines updated");
            
        } catch (Exception e) {
            System.err.println("Error in automated fine updates: " + e.getMessage());
        }
    }
    
    /**
     * Manual method to process all overdue books immediately
     * Can be called by administrators when needed
     */
    public ProcessingResult processOverdueBooksManually() {
        ProcessingResult result = new ProcessingResult();
        
        try {
            LocalDate today = LocalDate.now();
            
            List<BorrowRecord> overdueBorrows = borrowRecordRepository.findAll().stream()
                .filter(record -> "APPROVED".equals(record.getStatus()))
                .filter(record -> record.getReturnDate() == null)
                .filter(record -> record.getDueDate() != null && record.getDueDate().isBefore(today))
                .collect(Collectors.toList());
            
            for (BorrowRecord record : overdueBorrows) {
                try {
                    if (!Boolean.TRUE.equals(record.getOverdue())) {
                        record.setOverdue(true);
                        borrowRecordRepository.save(record);
                        result.recordsProcessed++;
                    }
                    
                    List<Fine> existingFines = fineRepository.findByBorrowRecordID(record.getId());
                    if (existingFines.isEmpty() && fineService != null) {
                        fineService.calculateAndCreateAutomaticFine(record.getId());
                        result.finesCreated++;
                    }
                } catch (Exception e) {
                    result.errors.add("Failed to process record " + record.getId() + ": " + e.getMessage());
                }
            }
            
            result.success = true;
            
        } catch (Exception e) {
            result.success = false;
            result.errors.add("General error: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Get statistics about overdue books and fines
     */
    public OverdueStatistics getOverdueStatistics() {
        OverdueStatistics stats = new OverdueStatistics();
        
        try {
            LocalDate today = LocalDate.now();
            
            // Count overdue books
            List<BorrowRecord> overdueBorrows = borrowRecordRepository.findAll().stream()
                .filter(record -> "APPROVED".equals(record.getStatus()))
                .filter(record -> record.getReturnDate() == null)
                .filter(record -> record.getDueDate() != null && record.getDueDate().isBefore(today))
                .collect(Collectors.toList());
            
            stats.totalOverdueBooks = overdueBorrows.size();
            
            // Count books overdue by different periods
            stats.overdue1to7Days = (int) overdueBorrows.stream()
                .filter(record -> {
                    long days = ChronoUnit.DAYS.between(record.getDueDate(), today);
                    return days >= 1 && days <= 7;
                })
                .count();
            
            stats.overdue8to30Days = (int) overdueBorrows.stream()
                .filter(record -> {
                    long days = ChronoUnit.DAYS.between(record.getDueDate(), today);
                    return days >= 8 && days <= 30;
                })
                .count();
            
            stats.overdueOver30Days = (int) overdueBorrows.stream()
                .filter(record -> {
                    long days = ChronoUnit.DAYS.between(record.getDueDate(), today);
                    return days > 30;
                })
                .count();
            
            // Count unpaid fines
            stats.unpaidFines = fineRepository.findByStatus("UNPAID").size();
            stats.partiallyPaidFines = fineRepository.findByStatus("PARTIALLY_PAID").size();
            
            // Calculate total outstanding amount
            List<Fine> outstandingFines = fineRepository.findAll().stream()
                .filter(fine -> "UNPAID".equals(fine.getStatus()) || "PARTIALLY_PAID".equals(fine.getStatus()))
                .collect(Collectors.toList());
            
            stats.totalOutstandingAmount = outstandingFines.stream()
                .mapToDouble(fine -> fine.getAmountDue())
                .sum();
            
        } catch (Exception e) {
            System.err.println("Error calculating overdue statistics: " + e.getMessage());
        }
        
        return stats;
    }
    
    /**
     * Result class for manual processing operations
     */
    public static class ProcessingResult {
        public boolean success = false;
        public int recordsProcessed = 0;
        public int finesCreated = 0;
        public List<String> errors = new java.util.ArrayList<>();
    }
    
    /**
     * Statistics class for overdue information
     */
    public static class OverdueStatistics {
        public int totalOverdueBooks = 0;
        public int overdue1to7Days = 0;
        public int overdue8to30Days = 0;
        public int overdueOver30Days = 0;
        public int unpaidFines = 0;
        public int partiallyPaidFines = 0;
        public double totalOutstandingAmount = 0.0;
    }
}