package com.example.lms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Document(collection = "payments")
public class Payment {
    @Id
    private String id;
    private String fineID;
    private String memberID;
    private Double amount;
    private LocalDate paymentDate;
    private String paymentMethod; // CASH, CARD, ONLINE
    private String notes;

    // Default constructor for MongoDB
    public Payment() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getFineID() { return fineID; }
    public void setFineID(String fineID) { this.fineID = fineID; }
    
    public String getMemberID() { return memberID; }
    public void setMemberID(String memberID) { this.memberID = memberID; }
    
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    
    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
