package com.example.lms.controller;

import com.example.lms.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {
    
    @Autowired
    private ReportService reportService;
    
    // Book Reports
    @GetMapping("/books/most-borrowed")
    public List<Map<String, Object>> getMostBorrowedBooks(@RequestParam(defaultValue = "10") int limit) {
        return reportService.getMostBorrowedBooks(limit);
    }
    
    @GetMapping("/books/least-borrowed")
    public List<Map<String, Object>> getLeastBorrowedBooks(@RequestParam(defaultValue = "10") int limit) {
        return reportService.getLeastBorrowedBooks(limit);
    }
    
    @GetMapping("/books/statistics")
    public Map<String, Object> getBookStatistics() {
        return reportService.getBookStatistics();
    }
    
    // User Reports
    @GetMapping("/members/most-active")
    public List<Map<String, Object>> getMostActiveMembers(@RequestParam(defaultValue = "10") int limit) {
        return reportService.getMostActiveMembers(limit);
    }
    
    @GetMapping("/members/{memberID}/activity")
    public Map<String, Object> getMemberActivityReport(@PathVariable String memberID) {
        return reportService.getMemberActivityReport(memberID);
    }
    
    @GetMapping("/members/statistics")
    public Map<String, Object> getMemberStatistics() {
        return reportService.getMemberStatistics();
    }
    
    // Overdue Reports
    @GetMapping("/overdue")
    public List<Map<String, Object>> getOverdueReport() {
        return reportService.getOverdueReport();
    }
    
    @GetMapping("/overdue/statistics")
    public Map<String, Object> getOverdueStatistics() {
        return reportService.getOverdueStatistics();
    }
    
    // Fine Reports
    @GetMapping("/fines")
    public Map<String, Object> getFineReport() {
        return reportService.getFineReport();
    }
    
    @GetMapping("/payments/recent")
    public List<Map<String, Object>> getRecentPayments(@RequestParam(defaultValue = "10") int limit) {
        return reportService.getRecentPayments(limit);
    }
    
    // Dashboard Summary
    @GetMapping("/dashboard-summary")
    public Map<String, Object> getDashboardSummary() {
        return reportService.getDashboardSummary();
    }
}
