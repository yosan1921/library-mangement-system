package com.example.lms.service;

import com.example.lms.model.Book;
import com.example.lms.model.Reservation;
import com.example.lms.repository.BookRepository;
import com.example.lms.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class ReservationService {
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
    public Reservation createReservation(String memberID, String bookID) {
        Reservation reservation = new Reservation();
        reservation.setMemberID(memberID);
        reservation.setBookID(bookID);
        reservation.setReservationDate(LocalDate.now());
        reservation.setStatus("PENDING");
        return reservationRepository.save(reservation);
    }
    
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }
    
    public List<Reservation> getMemberReservations(String memberID) {
        return reservationRepository.findByMemberID(memberID);
    }
    
    public List<Reservation> getPendingReservations() {
        return reservationRepository.findByStatus("PENDING");
    }
    
    public List<Reservation> getApprovedReservations() {
        return reservationRepository.findByStatus("APPROVED");
    }
    
    public Reservation approveReservation(String id) {
        Reservation reservation = reservationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        if (!"PENDING".equals(reservation.getStatus())) {
            throw new RuntimeException("Only pending reservations can be approved");
        }
        
        reservation.setStatus("APPROVED");
        return reservationRepository.save(reservation);
    }
    
    public Reservation notifyMember(String id) {
        Reservation reservation = reservationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        if (!"APPROVED".equals(reservation.getStatus())) {
            throw new RuntimeException("Only approved reservations can be notified");
        }
        
        Book book = bookRepository.findById(reservation.getBookID())
            .orElseThrow(() -> new RuntimeException("Book not found"));
        
        if (book.getCopiesAvailable() <= 0) {
            throw new RuntimeException("Book is not available yet");
        }
        
        reservation.setNotifiedDate(LocalDate.now());
        reservation.setExpiryDate(LocalDate.now().plusDays(3)); // 3 days to pick up
        return reservationRepository.save(reservation);
    }
    
    public Reservation fulfillReservation(String id) {
        Reservation reservation = reservationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        if (!"APPROVED".equals(reservation.getStatus())) {
            throw new RuntimeException("Only approved reservations can be fulfilled");
        }
        
        reservation.setStatus("FULFILLED");
        return reservationRepository.save(reservation);
    }
    
    public Reservation cancelReservationByAdmin(String id) {
        Reservation reservation = reservationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        reservation.setStatus("CANCELLED");
        return reservationRepository.save(reservation);
    }
    
    public List<Reservation> getExpiredReservations() {
        List<Reservation> approved = reservationRepository.findByStatus("APPROVED");
        LocalDate today = LocalDate.now();
        return approved.stream()
            .filter(r -> r.getExpiryDate() != null && r.getExpiryDate().isBefore(today))
            .toList();
    }
    
    public List<Reservation> getReservationsByBook(String bookID) {
        return reservationRepository.findByBookID(bookID);
    }
    
    public Reservation updateReservationStatus(String id, String status) {
        Reservation reservation = reservationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        reservation.setStatus(status);
        return reservationRepository.save(reservation);
    }
    
    public void cancelReservation(String id) {
        reservationRepository.deleteById(id);
    }
}
