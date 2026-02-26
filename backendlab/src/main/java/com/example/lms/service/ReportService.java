package com.example.lms.service;

import com.example.lms.model.Book;
import com.example.lms.model.BorrowRecord;
import com.example.lms.model.Fine;
import com.example.lms.model.Member;
import com.example.lms.model.Payment;
import com.example.lms.repository.BookRepository;
import com.example.lms.repository.BorrowRecordRepository;
import com.example.lms.repository.FineRepository;
import com.example.lms.repository.MemberRepository;
import com.example.lms.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {
    
    @Autowired
    private BorrowRecordRepository borrowRecordRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private FineRepository fineRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    // Book Reports
    public List<Map<String, Object>> getMostBorrowedBooks(int limit) {
        try {
            List<BorrowRecord> allRecords = borrowRecordRepository.findAll();
            if (allRecords == null || allRecords.isEmpty()) {
                return new ArrayList<>();
            }
            
            Map<String, Long> bookBorrowCounts = allRecords.stream()
                .filter(record -> record.getBookID() != null)
                .collect(Collectors.groupingBy(BorrowRecord::getBookID, Collectors.counting()));
            
            return bookBorrowCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> result = new HashMap<>();
                    Book book = bookRepository.findById(entry.getKey()).orElse(null);
                    result.put("bookID", entry.getKey());
                    result.put("bookTitle", book != null ? book.getTitle() : "Unknown");
                    result.put("author", book != null ? book.getAuthor() : "Unknown");
                    result.put("borrowCount", entry.getValue());
                    return result;
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in getMostBorrowedBooks: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    public List<Map<String, Object>> getLeastBorrowedBooks(int limit) {
        try {
            List<Book> allBooks = bookRepository.findAll();
            if (allBooks == null || allBooks.isEmpty()) {
                return new ArrayList<>();
            }
            
            List<BorrowRecord> allRecords = borrowRecordRepository.findAll();
            Map<String, Long> bookBorrowCounts = new HashMap<>();
            
            if (allRecords != null && !allRecords.isEmpty()) {
                bookBorrowCounts = allRecords.stream()
                    .filter(record -> record.getBookID() != null)
                    .collect(Collectors.groupingBy(BorrowRecord::getBookID, Collectors.counting()));
            }
            
            final Map<String, Long> finalBookBorrowCounts = bookBorrowCounts;
            return allBooks.stream()
                .map(book -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("bookID", book.getId());
                    result.put("bookTitle", book.getTitle());
                    result.put("author", book.getAuthor());
                    result.put("borrowCount", finalBookBorrowCounts.getOrDefault(book.getId(), 0L));
                    return result;
                })
                .sorted(Comparator.comparingLong(m -> (Long) m.get("borrowCount")))
                .limit(limit)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in getLeastBorrowedBooks: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    public Map<String, Object> getBookStatistics() {
        try {
            List<Book> allBooks = bookRepository.findAll();
            List<BorrowRecord> allRecords = borrowRecordRepository.findAll();
            
            int totalBooks = allBooks != null ? allBooks.size() : 0;
            int totalCopies = allBooks != null ? allBooks.stream().mapToInt(Book::getTotalCopies).sum() : 0;
            int availableCopies = allBooks != null ? allBooks.stream().mapToInt(Book::getCopiesAvailable).sum() : 0;
            int borrowedCopies = totalCopies - availableCopies;
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalBooks", totalBooks);
            stats.put("totalCopies", totalCopies);
            stats.put("availableCopies", availableCopies);
            stats.put("borrowedCopies", borrowedCopies);
            stats.put("totalBorrows", allRecords != null ? allRecords.size() : 0);
            
            return stats;
        } catch (Exception e) {
            System.err.println("Error in getBookStatistics: " + e.getMessage());
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalBooks", 0);
            stats.put("totalCopies", 0);
            stats.put("availableCopies", 0);
            stats.put("borrowedCopies", 0);
            stats.put("totalBorrows", 0);
            return stats;
        }
    }
    
    // User Reports
    public List<Map<String, Object>> getMostActiveMembers(int limit) {
        try {
            List<BorrowRecord> allRecords = borrowRecordRepository.findAll();
            if (allRecords == null || allRecords.isEmpty()) {
                return new ArrayList<>();
            }
            
            Map<String, Long> memberBorrowCounts = allRecords.stream()
                .filter(record -> record.getMemberID() != null)
                .collect(Collectors.groupingBy(BorrowRecord::getMemberID, Collectors.counting()));
            
            return memberBorrowCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> result = new HashMap<>();
                    Member member = memberRepository.findById(entry.getKey()).orElse(null);
                    result.put("memberID", entry.getKey());
                    result.put("memberName", member != null ? member.getName() : "Unknown");
                    result.put("email", member != null ? member.getContact() : "Unknown");
                    result.put("borrowCount", entry.getValue());
                    return result;
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in getMostActiveMembers: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    public Map<String, Object> getMemberActivityReport(String memberID) {
        Member member = memberRepository.findById(memberID).orElse(null);
        List<BorrowRecord> borrowHistory = borrowRecordRepository.findByMemberID(memberID);
        List<Fine> fines = fineRepository.findByMemberID(memberID);
        List<Payment> payments = paymentRepository.findByMemberID(memberID);
        
        long activeBorrows = borrowHistory.stream()
            .filter(r -> r.getReturnDate() == null)
            .count();
        
        long overdueBorrows = borrowHistory.stream()
            .filter(r -> r.getOverdue() != null && r.getOverdue())
            .count();
        
        Double totalFines = fines.stream()
            .mapToDouble(Fine::getAmount)
            .sum();
        
        Double totalPaid = payments.stream()
            .mapToDouble(Payment::getAmount)
            .sum();
        
        Map<String, Object> report = new HashMap<>();
        report.put("memberID", memberID);
        report.put("memberName", member != null ? member.getName() : "Unknown");
        report.put("email", member != null ? member.getContact() : "Unknown");
        report.put("totalBorrows", borrowHistory.size());
        report.put("activeBorrows", activeBorrows);
        report.put("overdueBorrows", overdueBorrows);
        report.put("totalFines", totalFines);
        report.put("totalPaid", totalPaid);
        report.put("borrowHistory", borrowHistory);
        
        return report;
    }
    
    public Map<String, Object> getMemberStatistics() {
        try {
            List<Member> allMembers = memberRepository.findAll();
            List<BorrowRecord> allRecords = borrowRecordRepository.findAll();
            
            long activeMembers = 0;
            if (allRecords != null && !allRecords.isEmpty()) {
                activeMembers = allRecords.stream()
                    .filter(r -> r.getReturnDate() == null && r.getMemberID() != null)
                    .map(BorrowRecord::getMemberID)
                    .distinct()
                    .count();
            }
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalMembers", allMembers != null ? allMembers.size() : 0);
            stats.put("activeMembers", activeMembers);
            
            return stats;
        } catch (Exception e) {
            System.err.println("Error in getMemberStatistics: " + e.getMessage());
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalMembers", 0);
            stats.put("activeMembers", 0);
            return stats;
        }
    }
    
    // Overdue Reports
    public List<Map<String, Object>> getOverdueReport() {
        try {
            List<BorrowRecord> overdueRecords = borrowRecordRepository.findByOverdue(true);
            if (overdueRecords == null || overdueRecords.isEmpty()) {
                return new ArrayList<>();
            }
            
            return overdueRecords.stream()
                .map(record -> {
                    Map<String, Object> result = new HashMap<>();
                    Member member = memberRepository.findById(record.getMemberID()).orElse(null);
                    Book book = bookRepository.findById(record.getBookID()).orElse(null);
                    
                    result.put("recordID", record.getId());
                    result.put("memberID", record.getMemberID());
                    result.put("memberName", member != null ? member.getName() : "Unknown");
                    result.put("memberEmail", member != null ? member.getContact() : "Unknown");
                    result.put("bookID", record.getBookID());
                    result.put("bookTitle", book != null ? book.getTitle() : "Unknown");
                    result.put("issueDate", record.getIssueDate());
                    result.put("dueDate", record.getDueDate());
                    result.put("daysOverdue", record.getDueDate() != null ? 
                        java.time.temporal.ChronoUnit.DAYS.between(record.getDueDate(), LocalDate.now()) : 0);
                    
                    return result;
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in getOverdueReport: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    public Map<String, Object> getOverdueStatistics() {
        try {
            List<BorrowRecord> overdueRecords = borrowRecordRepository.findByOverdue(true);
            
            long totalOverdue = overdueRecords != null ? overdueRecords.size() : 0;
            long uniqueMembers = 0;
            long uniqueBooks = 0;
            
            if (overdueRecords != null && !overdueRecords.isEmpty()) {
                uniqueMembers = overdueRecords.stream()
                    .filter(r -> r.getMemberID() != null)
                    .map(BorrowRecord::getMemberID)
                    .distinct()
                    .count();
                
                uniqueBooks = overdueRecords.stream()
                    .filter(r -> r.getBookID() != null)
                    .map(BorrowRecord::getBookID)
                    .distinct()
                    .count();
            }
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalOverdue", totalOverdue);
            stats.put("uniqueMembers", uniqueMembers);
            stats.put("uniqueBooks", uniqueBooks);
            
            return stats;
        } catch (Exception e) {
            System.err.println("Error in getOverdueStatistics: " + e.getMessage());
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalOverdue", 0);
            stats.put("uniqueMembers", 0);
            stats.put("uniqueBooks", 0);
            return stats;
        }
    }
    
    // Fine Reports
    public Map<String, Object> getFineReport() {
        try {
            List<Fine> allFines = fineRepository.findAll();
            List<Payment> allPayments = paymentRepository.findAll();
            
            Double totalFines = 0.0;
            Double totalCollected = 0.0;
            Double totalOutstanding = 0.0;
            long unpaidCount = 0;
            long partiallyPaidCount = 0;
            long paidCount = 0;
            long waivedCount = 0;
            int totalCount = 0;
            
            if (allFines != null && !allFines.isEmpty()) {
                totalFines = allFines.stream().mapToDouble(Fine::getAmount).sum();
                totalOutstanding = allFines.stream()
                    .filter(f -> "UNPAID".equals(f.getStatus()) || "PARTIALLY_PAID".equals(f.getStatus()))
                    .mapToDouble(Fine::getAmountDue)
                    .sum();
                unpaidCount = allFines.stream()
                    .filter(f -> "UNPAID".equals(f.getStatus()))
                    .count();
                partiallyPaidCount = allFines.stream()
                    .filter(f -> "PARTIALLY_PAID".equals(f.getStatus()))
                    .count();
                paidCount = allFines.stream()
                    .filter(f -> "PAID".equals(f.getStatus()))
                    .count();
                waivedCount = allFines.stream()
                    .filter(f -> "WAIVED".equals(f.getStatus()))
                    .count();
                totalCount = allFines.size();
            }
            
            if (allPayments != null && !allPayments.isEmpty()) {
                totalCollected = allPayments.stream().mapToDouble(Payment::getAmount).sum();
            }
            
            Map<String, Object> report = new HashMap<>();
            report.put("totalFines", totalFines);
            report.put("totalCollected", totalCollected);
            report.put("totalOutstanding", totalOutstanding);
            report.put("unpaidCount", unpaidCount);
            report.put("partiallyPaidCount", partiallyPaidCount);
            report.put("paidCount", paidCount);
            report.put("waivedCount", waivedCount);
            report.put("totalCount", totalCount);
            
            return report;
        } catch (Exception e) {
            System.err.println("Error in getFineReport: " + e.getMessage());
            Map<String, Object> report = new HashMap<>();
            report.put("totalFines", 0.0);
            report.put("totalCollected", 0.0);
            report.put("totalOutstanding", 0.0);
            report.put("unpaidCount", 0);
            report.put("partiallyPaidCount", 0);
            report.put("paidCount", 0);
            report.put("waivedCount", 0);
            report.put("totalCount", 0);
            return report;
        }
    }
    
    public List<Map<String, Object>> getRecentPayments(int limit) {
        try {
            List<Payment> allPayments = paymentRepository.findAll();
            if (allPayments == null || allPayments.isEmpty()) {
                return new ArrayList<>();
            }
            
            return allPayments.stream()
                .filter(payment -> payment.getPaymentDate() != null)
                .sorted(Comparator.comparing(Payment::getPaymentDate).reversed())
                .limit(limit)
                .map(payment -> {
                    Map<String, Object> result = new HashMap<>();
                    Member member = memberRepository.findById(payment.getMemberID()).orElse(null);
                    Fine fine = fineRepository.findById(payment.getFineID()).orElse(null);
                    
                    result.put("paymentID", payment.getId());
                    result.put("memberID", payment.getMemberID());
                    result.put("memberName", member != null ? member.getName() : "Unknown");
                    result.put("amount", payment.getAmount());
                    result.put("paymentMethod", payment.getPaymentMethod());
                    result.put("paymentDate", payment.getPaymentDate());
                    result.put("fineReason", fine != null ? fine.getReason() : "Unknown");
                    
                    return result;
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in getRecentPayments: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    // Dashboard Summary
    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        summary.put("bookStats", getBookStatistics());
        summary.put("memberStats", getMemberStatistics());
        summary.put("overdueStats", getOverdueStatistics());
        summary.put("fineStats", getFineReport());
        
        return summary;
    }
}
