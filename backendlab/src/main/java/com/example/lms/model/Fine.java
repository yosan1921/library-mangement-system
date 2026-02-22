package com.example.lms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Document(collection = "fines")
public class Fine {
    @Id
    private String id;
    private String memberID;
    private String borrowRecordID;
    private Double amount;
    private Double amountPaid;
    private String reason;
    private LocalDate issueDate;
    private LocalDate paidDate;
    private String status; // UNPAID, PARTIALLY_PAID, PAID, WAIVED

    // Default constructor for MongoDB
    public Fine() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getMemberID() { return memberID; }
    public void setMemberID(String memberID) { this.memberID = memberID; }
    
    public String getBorrowRecordID() { return borrowRecordID; }
    public void setBorrowRecordID(String borrowRecordID) { this.borrowRecordID = borrowRecordID; }
    
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    
    public Double getAmountPaid() { return amountPaid; }
    public void setAmountPaid(Double amountPaid) { this.amountPaid = amountPaid; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    
    public LocalDate getPaidDate() { return paidDate; }
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Double getAmountDue() {
        if (amountPaid == null) return amount;
        return amount - amountPaid;
    }
}
