package com.example.lms.controller;

import com.example.lms.model.Fine;
import com.example.lms.model.Payment;
import com.example.lms.service.FineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fines")
@CrossOrigin(origins = "*")
public class FineController {
    
    @Autowired
    private FineService fineService;
    
    @GetMapping
    public List<Fine> getAllFines() {
        return fineService.getAllFines();
    }
    
    @GetMapping("/member/{memberID}")
    public List<Fine> getMemberFines(@PathVariable String memberID) {
        return fineService.getMemberFines(memberID);
    }
    
    @GetMapping("/member/{memberID}/outstanding")
    public ResponseEntity<Map<String, Double>> getMemberOutstanding(@PathVariable String memberID) {
        Double outstanding = fineService.getMemberTotalOutstanding(memberID);
        return ResponseEntity.ok(Map.of("outstanding", outstanding));
    }
    
    @GetMapping("/unpaid")
    public List<Fine> getUnpaidFines() {
        return fineService.getUnpaidFines();
    }
    
    @GetMapping("/paid")
    public List<Fine> getPaidFines() {
        return fineService.getPaidFines();
    }
    
    @GetMapping("/partially-paid")
    public List<Fine> getPartiallyPaidFines() {
        return fineService.getPartiallyPaidFines();
    }
    
    @PostMapping("/calculate/{borrowRecordID}")
    public ResponseEntity<Fine> calculateFine(@PathVariable String borrowRecordID) {
        try {
            return ResponseEntity.ok(fineService.calculateAndCreateFine(borrowRecordID));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/manual")
    public ResponseEntity<Fine> createManualFine(@RequestBody Map<String, Object> request) {
        try {
            String memberID = (String) request.get("memberID");
            Double amount = Double.valueOf(request.get("amount").toString());
            String reason = (String) request.get("reason");
            return ResponseEntity.ok(fineService.createManualFine(memberID, amount, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{fineID}/payment")
    public ResponseEntity<Payment> recordPayment(@PathVariable String fineID, @RequestBody Map<String, Object> request) {
        try {
            Double amount = Double.valueOf(request.get("amount").toString());
            String paymentMethod = (String) request.get("paymentMethod");
            String notes = (String) request.getOrDefault("notes", "");
            return ResponseEntity.ok(fineService.recordPayment(fineID, amount, paymentMethod, notes));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{fineID}/pay")
    public ResponseEntity<Fine> markAsPaid(@PathVariable String fineID) {
        try {
            Fine fine = fineService.markAsPaid(fineID);
            return ResponseEntity.ok(fine);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{fineID}/waive")
    public ResponseEntity<Fine> waiveFine(@PathVariable String fineID, @RequestBody(required = false) Map<String, String> request) {
        try {
            String reason = request != null && request.containsKey("reason") 
                ? request.get("reason") 
                : "Waived by librarian";
            return ResponseEntity.ok(fineService.waiveFine(fineID, reason));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/payments")
    public List<Payment> getAllPayments() {
        return fineService.getAllPayments();
    }
    
    @GetMapping("/payments/member/{memberID}")
    public List<Payment> getMemberPayments(@PathVariable String memberID) {
        return fineService.getMemberPayments(memberID);
    }
    
    @GetMapping("/report")
    public Map<String, Object> generateReport() {
        return fineService.generateFineReport();
    }
}
