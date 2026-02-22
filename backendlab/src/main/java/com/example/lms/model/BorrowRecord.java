package com.example.lms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Document(collection = "borrowRecords")
public class BorrowRecord {
    @Id
    private String id;
    private String memberID;
    private String bookID;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private Boolean overdue;
    private String status; // PENDING, APPROVED, REJECTED, RETURNED

    // Default constructor for MongoDB
    public BorrowRecord() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getMemberID() { return memberID; }
    public void setMemberID(String memberID) { this.memberID = memberID; }
    
    public String getBookID() { return bookID; }
    public void setBookID(String bookID) { this.bookID = bookID; }
    
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    
    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }
    
    public Boolean getOverdue() { return overdue; }
    public void setOverdue(Boolean overdue) { this.overdue = overdue; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
