package com.example.lms.controller;

import com.example.lms.service.AutomatedFineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AutomatedFineController - REST endpoints for automated fine processing
 * 
 * Provides endpoints for:
 * 1. Manual triggering of overdue processing
 * 2. Getting overdue statistics
 * 3. Administrative fine management
 */
@RestController
@RequestMapping("/api/automated-fines")
@CrossOrigin(origins = "*")
public class AutomatedFineController {
    
    @Autowired
    private AutomatedFineService automatedFineService;
    
    /**
     * Manually trigger overdue book processing
     * Useful for administrators who want to process overdue books immediately
     */
    @PostMapping("/process-overdue")
    public ResponseEntity<?> processOverdueBooks() {
        try {
            AutomatedFineService.ProcessingResult result = automatedFineService.processOverdueBooksManually();
            
            if (result.success) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Overdue processing completed successfully",
                    "recordsProcessed", result.recordsProcessed,
                    "finesCreated", result.finesCreated,
                    "errors", result.errors
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Overdue processing completed with errors",
                    "recordsProcessed", result.recordsProcessed,
                    "finesCreated", result.finesCreated,
                    "errors", result.errors
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to process overdue books",
                "error", e.getMessage()
            ));
        }
    }
    
    /**
     * Get comprehensive overdue statistics
     * Provides dashboard information for administrators
     */
    @GetMapping("/statistics")
    public ResponseEntity<AutomatedFineService.OverdueStatistics> getOverdueStatistics() {
        try {
            AutomatedFineService.OverdueStatistics stats = automatedFineService.getOverdueStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get a summary of overdue information for quick dashboard display
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getOverdueSummary() {
        try {
            AutomatedFineService.OverdueStatistics stats = automatedFineService.getOverdueStatistics();
            
            return ResponseEntity.ok(Map.of(
                "totalOverdueBooks", stats.totalOverdueBooks,
                "totalUnpaidFines", stats.unpaidFines + stats.partiallyPaidFines,
                "totalOutstandingAmount", stats.totalOutstandingAmount,
                "criticalOverdue", stats.overdueOver30Days // Books overdue more than 30 days
            ));
        } catch (Exception e) {
           // return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to get overdue summary",
                "message", e.getMessage()
            ));
        }
    }
}