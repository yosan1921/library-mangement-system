package com.example.lms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Document(collection = "reservations")
public class Reservation {
    @Id
    private String id;
    private String memberID;
    private String bookID;
    private LocalDate reservationDate;
    private String status; // PENDING, APPROVED, CANCELLED, FULFILLED
    private LocalDate notifiedDate;
    private LocalDate expiryDate;

    // Default constructor for MongoDB
    public Reservation() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getMemberID() { return memberID; }
    public void setMemberID(String memberID) { this.memberID = memberID; }
    
    public String getBookID() { return bookID; }
    public void setBookID(String bookID) { this.bookID = bookID; }
    
    public LocalDate getReservationDate() { return reservationDate; }
    public void setReservationDate(LocalDate reservationDate) { this.reservationDate = reservationDate; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDate getNotifiedDate() { return notifiedDate; }
    public void setNotifiedDate(LocalDate notifiedDate) { this.notifiedDate = notifiedDate; }
    
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
}
