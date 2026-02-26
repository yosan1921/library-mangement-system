package com.example.lms.service;

import com.example.lms.model.BorrowRecord;
import com.example.lms.model.Fine;
import com.example.lms.model.Member;
import com.example.lms.model.Payment;
import com.example.lms.repository.BorrowRecordRepository;
import com.example.lms.repository.FineRepository;
import com.example.lms.repository.MemberRepository;
import com.example.lms.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@Service
public class FineService {
    
    @Autowired
    private FineRepository fineRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private BorrowRecordRepository borrowRecordRepository;
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired(required = false)
    private NotificationService notificationService;
    
    private static final Double FINE_PER_DAY = 1.0; // $1 per day overdue
    
    public Fine calculateAndCreateFine(String borrowRecordID) {
        BorrowRecord record = borrowRecordRepository.findById(borrowRecordID)
            .orElseThrow(() -> new RuntimeException("Borrow record not found"));
        
        if (record.getDueDate() == null || record.getReturnDate() == null) {
            throw new RuntimeException("Cannot calculate fine: missing dates");
        }
        
        long daysOverdue = ChronoUnit.DAYS.between(record.getDueDate(), record.getReturnDate());
        
        if (daysOverdue <= 0) {
            throw new RuntimeException("Book was not overdue");
        }
        
        // Check if fine already exists for this borrow record
        List<Fine> existingFines = fineRepository.findByBorrowRecordID(borrowRecordID);
        if (!existingFines.isEmpty()) {
            throw new RuntimeException("Fine already exists for this borrow record");
        }
        
        Fine fine = new Fine();
        fine.setMemberID(record.getMemberID());
        fine.setBorrowRecordID(borrowRecordID);
        fine.setAmount(daysOverdue * FINE_PER_DAY);
        fine.setAmountPaid(0.0);
        fine.setReason("Overdue return: " + daysOverdue + " days late");
        fine.setIssueDate(LocalDate.now());
        fine.setStatus("UNPAID");
        
        return fineRepository.save(fine);
    }
    
    public Fine createManualFine(String memberID, Double amount, String reason) {
        Fine fine = new Fine();
        fine.setMemberID(memberID);
        fine.setAmount(amount);
        fine.setAmountPaid(0.0);
        fine.setReason(reason);
        fine.setIssueDate(LocalDate.now());
        fine.setStatus("UNPAID");
        
        Fine savedFine = fineRepository.save(fine);
        
        // Send notification if service is available
        if (notificationService != null) {
            try {
                Optional<Member> optMember = memberRepository.findById(memberID);
                if (optMember.isPresent()) {
                    notificationService.createFineNotification(savedFine, optMember.get());
                }
            } catch (Exception e) {
                // Log error but don't fail the fine creation
                System.err.println("Failed to create fine notification: " + e.getMessage());
            }
        }
        
        return savedFine;
    }
    
    public Payment recordPayment(String fineID, Double amount, String paymentMethod, String notes) {
        Fine fine = fineRepository.findById(fineID)
            .orElseThrow(() -> new RuntimeException("Fine not found"));
        
        if ("PAID".equals(fine.getStatus()) || "WAIVED".equals(fine.getStatus())) {
            throw new RuntimeException("Fine is already settled");
        }
        
        Double currentPaid = fine.getAmountPaid() != null ? fine.getAmountPaid() : 0.0;
        Double newPaid = currentPaid + amount;
        
        if (newPaid > fine.getAmount()) {
            throw new RuntimeException("Payment amount exceeds fine amount");
        }
        
        // Create payment record
        Payment payment = new Payment();
        payment.setFineID(fineID);
        payment.setMemberID(fine.getMemberID());
        payment.setAmount(amount);
        payment.setPaymentDate(LocalDate.now());
        payment.setPaymentMethod(paymentMethod);
        payment.setNotes(notes);
        paymentRepository.save(payment);
        
        // Update fine
        fine.setAmountPaid(newPaid);
        if (newPaid.equals(fine.getAmount())) {
            fine.setStatus("PAID");
            fine.setPaidDate(LocalDate.now());
        } else {
            fine.setStatus("PARTIALLY_PAID");
        }
        
        fineRepository.save(fine);
        return payment;
    }
    
    public Fine markAsPaid(String fineID) {
        Fine fine = fineRepository.findById(fineID)
            .orElseThrow(() -> new RuntimeException("Fine not found"));
        
        if ("PAID".equals(fine.getStatus())) {
            throw new RuntimeException("Fine is already paid");
        }
        
        if ("WAIVED".equals(fine.getStatus())) {
            throw new RuntimeException("Fine is already waived");
        }
        
        // Calculate remaining amount to pay
        Double currentPaid = fine.getAmountPaid() != null ? fine.getAmountPaid() : 0.0;
        Double remainingAmount = fine.getAmount() - currentPaid;
        
        // Create a payment record for the remaining amount
        if (remainingAmount > 0) {
            Payment payment = new Payment();
            payment.setFineID(fineID);
            payment.setMemberID(fine.getMemberID());
            payment.setAmount(remainingAmount);
            payment.setPaymentDate(LocalDate.now());
            payment.setPaymentMethod("CASH");
            payment.setNotes("Marked as paid by librarian");
            paymentRepository.save(payment);
        }
        
        // Mark as fully paid
        fine.setAmountPaid(fine.getAmount());
        fine.setStatus("PAID");
        fine.setPaidDate(LocalDate.now());
        
        return fineRepository.save(fine);
    }
    
    public Fine waiveFine(String fineID, String reason) {
        Fine fine = fineRepository.findById(fineID)
            .orElseThrow(() -> new RuntimeException("Fine not found"));
        
        fine.setStatus("WAIVED");
        fine.setReason(fine.getReason() + " [WAIVED: " + reason + "]");
        fine.setPaidDate(LocalDate.now());
        
        return fineRepository.save(fine);
    }
    
    public List<Fine> getAllFines() {
        return fineRepository.findAll();
    }
    
    public List<Fine> getMemberFines(String memberID) {
        return fineRepository.findByMemberID(memberID);
    }
    
    public List<Fine> getUnpaidFines() {
        return fineRepository.findByStatus("UNPAID");
    }
    
    public List<Fine> getPaidFines() {
        return fineRepository.findByStatus("PAID");
    }
    
    public List<Fine> getPartiallyPaidFines() {
        return fineRepository.findByStatus("PARTIALLY_PAID");
    }
    
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
    
    public List<Payment> getMemberPayments(String memberID) {
        return paymentRepository.findByMemberID(memberID);
    }
    
    public Map<String, Object> generateFineReport() {
        List<Fine> allFines = fineRepository.findAll();
        
        Double totalFines = 0.0;
        Double totalPaid = 0.0;
        Double totalOutstanding = 0.0;
        int unpaidCount = 0;
        int partiallyPaidCount = 0;
        int paidCount = 0;
        int waivedCount = 0;
        
        for (Fine fine : allFines) {
            totalFines += fine.getAmount();
            totalPaid += (fine.getAmountPaid() != null ? fine.getAmountPaid() : 0.0);
            
            switch (fine.getStatus()) {
                case "UNPAID":
                    unpaidCount++;
                    totalOutstanding += fine.getAmount();
                    break;
                case "PARTIALLY_PAID":
                    partiallyPaidCount++;
                    totalOutstanding += fine.getAmountDue();
                    break;
                case "PAID":
                    paidCount++;
                    break;
                case "WAIVED":
                    waivedCount++;
                    break;
            }
        }
        
        Map<String, Object> report = new HashMap<>();
        report.put("totalFines", totalFines);
        report.put("totalPaid", totalPaid);
        report.put("totalOutstanding", totalOutstanding);
        report.put("unpaidCount", unpaidCount);
        report.put("partiallyPaidCount", partiallyPaidCount);
        report.put("paidCount", paidCount);
        report.put("waivedCount", waivedCount);
        report.put("totalCount", allFines.size());
        
        return report;
    }
    
    public Double getMemberTotalOutstanding(String memberID) {
        List<Fine> memberFines = fineRepository.findByMemberID(memberID);
        Double total = 0.0;
        
        for (Fine fine : memberFines) {
            if ("UNPAID".equals(fine.getStatus()) || "PARTIALLY_PAID".equals(fine.getStatus())) {
                total += fine.getAmountDue();
            }
        }
        
        return total;
    }
}
