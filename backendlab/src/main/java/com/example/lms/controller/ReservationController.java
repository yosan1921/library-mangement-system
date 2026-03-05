package com.example.lms.controller;

import com.example.lms.model.Reservation;
import com.example.lms.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*")
public class ReservationController {
    
    @Autowired
    private ReservationService reservationService;
    
    @GetMapping
    public List<Reservation> getAllReservations() {
        return reservationService.getAllReservations();
    }
    
    @PostMapping
    public Reservation createReservation(@RequestBody Map<String, String> request) {
        String memberID = request.get("memberID");
        String bookID = request.get("bookID");
        return reservationService.createReservation(memberID, bookID);
    }
    
    @GetMapping("/member/{memberID}")
    public List<Reservation> getMemberReservations(@PathVariable String memberID) {
        return reservationService.getMemberReservations(memberID);
    }
    
    @GetMapping("/pending")
    public List<Reservation> getPendingReservations() {
        return reservationService.getPendingReservations();
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Reservation> updateStatus(@PathVariable String id, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            return ResponseEntity.ok(reservationService.updateReservationStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReservation(@PathVariable String id) {
        reservationService.cancelReservation(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/approve")
    public ResponseEntity<Reservation> approveReservation(@PathVariable String id) {
        try {
            return ResponseEntity.ok(reservationService.approveReservation(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/notify")
    public ResponseEntity<Reservation> notifyMember(@PathVariable String id) {
        try {
            return ResponseEntity.ok(reservationService.notifyMember(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/fulfill")
    public ResponseEntity<Reservation> fulfillReservation(@PathVariable String id) {
        try {
            return ResponseEntity.ok(reservationService.fulfillReservation(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/cancel-admin")
    public ResponseEntity<Reservation> cancelReservationByAdmin(@PathVariable String id) {
        try {
            return ResponseEntity.ok(reservationService.cancelReservationByAdmin(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/approved")
    public List<Reservation> getApprovedReservations() {
        return reservationService.getApprovedReservations();
    }
    
    @GetMapping("/expired")
    public List<Reservation> getExpiredReservations() {
        return reservationService.getExpiredReservations();
    }
    
    @GetMapping("/book/{bookID}")
    public List<Reservation> getReservationsByBook(@PathVariable String bookID) {
        return reservationService.getReservationsByBook(bookID);
    }
}
