package com.example.lms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "systemSettings")
public class SystemSettings {
    @Id
    private String id;
    
    // Library Policies
    private Integer maxBooksPerMember;
    private Integer borrowDurationDays;
    private Double finePerDay;
    private Integer maxRenewals;
    private Integer reservationExpiryDays;
    
    // Notification Settings
    private Boolean emailNotificationsEnabled;
    private Boolean smsNotificationsEnabled;
    private Integer dueDateReminderDays;
    private Integer overdueReminderDays;
    private String emailHost;
    private Integer emailPort;
    private String emailUsername;
    private String emailPassword;
    private String smsProvider;
    private String smsApiKey;
    
    // System Settings
    private String libraryName;
    private String libraryEmail;
    private String libraryPhone;
    private String libraryAddress;
    
    // Metadata
    private LocalDateTime lastUpdated;
    private String updatedBy;

    // Default constructor for MongoDB
    public SystemSettings() {
        // Set default values
        this.maxBooksPerMember = 5;
        this.borrowDurationDays = 14;
        this.finePerDay = 1.0;
        this.maxRenewals = 2;
        this.reservationExpiryDays = 3;
        this.emailNotificationsEnabled = false;
        this.smsNotificationsEnabled = false;
        this.dueDateReminderDays = 2;
        this.overdueReminderDays = 1;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public Integer getMaxBooksPerMember() { return maxBooksPerMember; }
    public void setMaxBooksPerMember(Integer maxBooksPerMember) { this.maxBooksPerMember = maxBooksPerMember; }
    
    public Integer getBorrowDurationDays() { return borrowDurationDays; }
    public void setBorrowDurationDays(Integer borrowDurationDays) { this.borrowDurationDays = borrowDurationDays; }
    
    public Double getFinePerDay() { return finePerDay; }
    public void setFinePerDay(Double finePerDay) { this.finePerDay = finePerDay; }
    
    public Integer getMaxRenewals() { return maxRenewals; }
    public void setMaxRenewals(Integer maxRenewals) { this.maxRenewals = maxRenewals; }
    
    public Integer getReservationExpiryDays() { return reservationExpiryDays; }
    public void setReservationExpiryDays(Integer reservationExpiryDays) { this.reservationExpiryDays = reservationExpiryDays; }
    
    public Boolean getEmailNotificationsEnabled() { return emailNotificationsEnabled; }
    public void setEmailNotificationsEnabled(Boolean emailNotificationsEnabled) { this.emailNotificationsEnabled = emailNotificationsEnabled; }
    
    public Boolean getSmsNotificationsEnabled() { return smsNotificationsEnabled; }
    public void setSmsNotificationsEnabled(Boolean smsNotificationsEnabled) { this.smsNotificationsEnabled = smsNotificationsEnabled; }
    
    public Integer getDueDateReminderDays() { return dueDateReminderDays; }
    public void setDueDateReminderDays(Integer dueDateReminderDays) { this.dueDateReminderDays = dueDateReminderDays; }
    
    public Integer getOverdueReminderDays() { return overdueReminderDays; }
    public void setOverdueReminderDays(Integer overdueReminderDays) { this.overdueReminderDays = overdueReminderDays; }
    
    public String getEmailHost() { return emailHost; }
    public void setEmailHost(String emailHost) { this.emailHost = emailHost; }
    
    public Integer getEmailPort() { return emailPort; }
    public void setEmailPort(Integer emailPort) { this.emailPort = emailPort; }
    
    public String getEmailUsername() { return emailUsername; }
    public void setEmailUsername(String emailUsername) { this.emailUsername = emailUsername; }
    
    public String getEmailPassword() { return emailPassword; }
    public void setEmailPassword(String emailPassword) { this.emailPassword = emailPassword; }
    
    public String getSmsProvider() { return smsProvider; }
    public void setSmsProvider(String smsProvider) { this.smsProvider = smsProvider; }
    
    public String getSmsApiKey() { return smsApiKey; }
    public void setSmsApiKey(String smsApiKey) { this.smsApiKey = smsApiKey; }
    
    public String getLibraryName() { return libraryName; }
    public void setLibraryName(String libraryName) { this.libraryName = libraryName; }
    
    public String getLibraryEmail() { return libraryEmail; }
    public void setLibraryEmail(String libraryEmail) { this.libraryEmail = libraryEmail; }
    
    public String getLibraryPhone() { return libraryPhone; }
    public void setLibraryPhone(String libraryPhone) { this.libraryPhone = libraryPhone; }
    
    public String getLibraryAddress() { return libraryAddress; }
    public void setLibraryAddress(String libraryAddress) { this.libraryAddress = libraryAddress; }
    
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
