package com.example.lms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String memberId;
    private String memberName;
    private String memberEmail;
    private String memberContact;
    private String type; // EMAIL, SMS, BOTH
    private String category; // DUE_DATE_REMINDER, OVERDUE_REMINDER, RESERVATION_READY, FINE_NOTICE, GENERAL
    private String subject;
    private String message;
    private Boolean sent;
    private LocalDateTime sentAt;
    private LocalDateTime createdAt;
    private String status; // PENDING, SENT, FAILED
    private String errorMessage;
    private String relatedEntityId; // borrowId, reservationId, fineId, etc.
    
    public Notification() {
        this.sent = false;
        this.createdAt = LocalDateTime.now();
        this.status = "PENDING";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }
    
    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
    
    public String getMemberEmail() { return memberEmail; }
    public void setMemberEmail(String memberEmail) { this.memberEmail = memberEmail; }
    
    public String getMemberContact() { return memberContact; }
    public void setMemberContact(String memberContact) { this.memberContact = memberContact; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public Boolean getSent() { return sent; }
    public void setSent(Boolean sent) { this.sent = sent; }
    
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    
    public String getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(String relatedEntityId) { this.relatedEntityId = relatedEntityId; }
}
