package com.example.lms.service;

import com.example.lms.model.*;
import com.example.lms.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BackupService {
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private BorrowRecordRepository borrowRecordRepository;
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    @Autowired
    private FineRepository fineRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private SystemSettingsRepository settingsRepository;
    
    private final ObjectMapper objectMapper;
    
    public BackupService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }
    
    public Map<String, Object> createBackup() {
        Map<String, Object> backup = new HashMap<>();
        
        backup.put("timestamp", LocalDateTime.now());
        backup.put("books", bookRepository.findAll());
        backup.put("members", memberRepository.findAll());
        backup.put("borrowRecords", borrowRecordRepository.findAll());
        backup.put("reservations", reservationRepository.findAll());
        backup.put("fines", fineRepository.findAll());
        backup.put("payments", paymentRepository.findAll());
        backup.put("settings", settingsRepository.findAll());
        
        return backup;
    }
    
    public String exportBackupToJson() throws IOException {
        Map<String, Object> backup = createBackup();
        return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(backup);
    }
    
    public Map<String, Object> getBackupStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalBooks", bookRepository.count());
        stats.put("totalMembers", memberRepository.count());
        stats.put("totalBorrowRecords", borrowRecordRepository.count());
        stats.put("totalReservations", reservationRepository.count());
        stats.put("totalFines", fineRepository.count());
        stats.put("totalPayments", paymentRepository.count());
        stats.put("timestamp", LocalDateTime.now());
        
        return stats;
    }
    
    @SuppressWarnings("unchecked")
    public void restoreFromBackup(Map<String, Object> backupData) {
        try {
            // Clear existing data (optional - can be made configurable)
            // bookRepository.deleteAll();
            // memberRepository.deleteAll();
            // etc.
            
            // Restore books
            if (backupData.containsKey("books")) {
                List<Map<String, Object>> books = (List<Map<String, Object>>) backupData.get("books");
                for (Map<String, Object> bookData : books) {
                    Book book = objectMapper.convertValue(bookData, Book.class);
                    bookRepository.save(book);
                }
            }
            
            // Restore members
            if (backupData.containsKey("members")) {
                List<Map<String, Object>> members = (List<Map<String, Object>>) backupData.get("members");
                for (Map<String, Object> memberData : members) {
                    Member member = objectMapper.convertValue(memberData, Member.class);
                    memberRepository.save(member);
                }
            }
            
            // Restore borrow records
            if (backupData.containsKey("borrowRecords")) {
                List<Map<String, Object>> records = (List<Map<String, Object>>) backupData.get("borrowRecords");
                for (Map<String, Object> recordData : records) {
                    BorrowRecord record = objectMapper.convertValue(recordData, BorrowRecord.class);
                    borrowRecordRepository.save(record);
                }
            }
            
            // Restore reservations
            if (backupData.containsKey("reservations")) {
                List<Map<String, Object>> reservations = (List<Map<String, Object>>) backupData.get("reservations");
                for (Map<String, Object> reservationData : reservations) {
                    Reservation reservation = objectMapper.convertValue(reservationData, Reservation.class);
                    reservationRepository.save(reservation);
                }
            }
            
            // Restore fines
            if (backupData.containsKey("fines")) {
                List<Map<String, Object>> fines = (List<Map<String, Object>>) backupData.get("fines");
                for (Map<String, Object> fineData : fines) {
                    Fine fine = objectMapper.convertValue(fineData, Fine.class);
                    fineRepository.save(fine);
                }
            }
            
            // Restore payments
            if (backupData.containsKey("payments")) {
                List<Map<String, Object>> payments = (List<Map<String, Object>>) backupData.get("payments");
                for (Map<String, Object> paymentData : payments) {
                    Payment payment = objectMapper.convertValue(paymentData, Payment.class);
                    paymentRepository.save(payment);
                }
            }
            
            // Restore settings
            if (backupData.containsKey("settings")) {
                List<Map<String, Object>> settings = (List<Map<String, Object>>) backupData.get("settings");
                for (Map<String, Object> settingData : settings) {
                    SystemSettings setting = objectMapper.convertValue(settingData, SystemSettings.class);
                    settingsRepository.save(setting);
                }
            }
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to restore backup: " + e.getMessage());
        }
    }
}
